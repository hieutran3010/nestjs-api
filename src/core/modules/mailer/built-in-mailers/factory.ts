import { Injectable } from '@nestjs/common';
import { IMailer, IMailerFactory } from '../abstract';
import { MailerType } from '../model';
import { MailerConfigurationService } from '../services/mailer-config.service';
import { NodeMailer } from './node-mailer';
import { SendGridMailer } from './send-grid';

@Injectable()
export class MailerFactory implements IMailerFactory {

    constructor(private readonly configurationService: MailerConfigurationService) {
    }

    create(): IMailer {

        let result: IMailer = null;

        switch (+this.configurationService.config.mailerType) {
            case MailerType.NodeMailer:
                result = new NodeMailer();
                break;
            case MailerType.SendGrid:
                result = new SendGridMailer();
                break;
        }

        result.mailerConfig = this.configurationService.config;
        result.init();

        return result;
    }
}