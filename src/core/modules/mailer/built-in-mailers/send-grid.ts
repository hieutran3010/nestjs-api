
import { Injectable } from '@nestjs/common';
import * as sendGrid from '@sendgrid/mail';
import { get } from 'lodash';
import { MailerBase } from '../abstract';
import { MailConfigure, TemplateMailConfigure } from '../model';

@Injectable()
export class SendGridMailer extends MailerBase {

    init() {

        if ((!this.mailerConfig.sendGrid) || (Object.keys(this.mailerConfig.sendGrid).length < 1)) {
            throw new Error('Make sure to provide sendgrid configuration');
        }
        sendGrid.setApiKey(this.mailerConfig.sendGrid.apiKey);
    }

    sendMail(emailConfiguration: MailConfigure | TemplateMailConfigure) {

        const body = this.parseTemplateFile(get(emailConfiguration, 'template'), get(emailConfiguration, 'context'));
        const msg = {
            to: emailConfiguration.to,
            from: this.mailerConfig.defaults.from,
            subject: emailConfiguration.subject,
            text: 'Send by SendGrid',
            html: body
        };

        sendGrid.send(msg);
    }
}