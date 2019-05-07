import * as fs from 'fs';
import { join } from 'path';
import { MailerConfig } from '../config';
import { MailConfigure, TemplateMailConfigure } from '../model';

interface IMailer {
    mailerConfig: MailerConfig;
    init(): void;
    sendMail(emailConfiguration: MailConfigure | TemplateMailConfigure);
}

interface IMailerFactory {
    create(): IMailer;
}

abstract class MailerBase implements IMailer {
    _mailerConfig: MailerConfig;

    get mailerConfig() {
        return this._mailerConfig;
    }

    set mailerConfig(value: MailerConfig) {
        this._mailerConfig = value;
    }

    abstract init();
    abstract async sendMail(emailConfiguration: MailConfigure | TemplateMailConfigure);

    protected parseTemplateFile(templateFileName: string, context: any): string {

        const templateFile = join(process.cwd(), this.mailerConfig.templateDir, templateFileName + '.html');

        const readFile = fs.readFileSync(templateFile, { encoding: 'utf8' });
        const templateContent = Buffer.isBuffer(readFile) ? readFile.toString('utf8') : readFile;
        const regex = new RegExp('#{-?[a-zA-Z0-9]+}', 'g');
        const resultTemplate = templateContent.replace(regex, (item) => {
            const property = item.substring(2, item.length - 1);
            let replace = '';
            if (context.hasOwnProperty(property)) {
                replace = context[property];
            }
            return replace;
        });
        return resultTemplate;
    }
}

export {IMailer, IMailerFactory, MailerBase};