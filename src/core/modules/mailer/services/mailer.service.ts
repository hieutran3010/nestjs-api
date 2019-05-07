import { Injectable } from '@nestjs/common';
import { isNil, join } from 'ramda';
import { IMailer } from '../abstract';
import { MailConfigure, TemplateMailConfigure } from '../model';
import { RequestContext } from './../../../../modules/auth/context/request-context';
import { MailerFactory } from './../built-in-mailers/factory';

@Injectable()
export class MailerService {

    private _mailer: IMailer;
    get mailer(): IMailer {
        if (isNil(this._mailer)) {
            this._mailer = this.mailerFactory.create();
        }
        return this._mailer;
    }

    constructor(private readonly mailerFactory: MailerFactory) {
    }

    sendMail(email: MailConfigure) {
        return this.mailer.sendMail(email);
    }

    sendMailWithTemplate(email: TemplateMailConfigure) {
        return this.mailer.sendMail(email);
    }

    buildLingualFileName(fileName: string) {
        const lang = RequestContext.currentRequestContext().langCode;
        return join('.', [fileName, lang ? lang : 'en']);
    }
}
