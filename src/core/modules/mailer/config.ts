import { MailerType } from './model';

class MailerConfig {
    defaultMailer: any;
    defaults: any;
    sendGrid: ISendGridMailerConfig;
    templateDir: string;
    mailerType: MailerType;
}

interface ISendGridMailerConfig {
    apiKey: string;
}

export {MailerConfig, ISendGridMailerConfig};