class MailConfigure {
    from?: string; // sender address. default used in mailer config file
    to: string; // list of receivers
    subject: string; // Subject line
    text?: string; // plaintext body
    html?: string; // html body
}

class TemplateMailConfigure extends MailConfigure {
    template: string; // email template file name locate in templates folder
    context?: any;     // optional, data context to support parser email template
}

enum MailerType {
    NodeMailer = 0,
    SendGrid,
    Extend
}

export {MailConfigure, TemplateMailConfigure, MailerType};