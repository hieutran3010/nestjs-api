import * as nodemailer from 'nodemailer';
import { isNil } from 'ramda';
import { MailerBase } from '../abstract';
import { MailConfigure, TemplateMailConfigure } from '../model';

class NodeMailer extends MailerBase {

    private transporter: nodemailer.Transporter;

    public init() {

        if ((!this.mailerConfig.defaultMailer) || (Object.keys(this.mailerConfig.defaultMailer).length < 1)) {
            throw new Error('Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance');
        }

        // Create reusable transporter object using SMTP transport and set default values for mail options.
        this.transporter = nodemailer.createTransport(this.mailerConfig.defaultMailer, this.mailerConfig.defaults);
        this.transporter.use('compile', this.renderTemplate());
    }

    async sendMail(emailConfiguration: MailConfigure | TemplateMailConfigure) {
        // setup e-mail data with unicode symbols
        const mailOptions: nodemailer.SendMailOptions = {};
        Object.assign(mailOptions, emailConfiguration);
        mailOptions.from = isNil(emailConfiguration.from) ? this.mailerConfig.defaults.from : emailConfiguration.from;

        await this.transporter.sendMail(mailOptions);
    }

    private renderTemplate(): (mail, callback) => void {
        return (mail, callback) => {
            if (mail.data.html) {
                return callback();
            }

            const body = this.parseTemplateFile(mail.data.template, mail.data.context);
            mail.data.html = body;

            return callback();
        };
    }
}

export { NodeMailer, MailConfigure, TemplateMailConfigure };