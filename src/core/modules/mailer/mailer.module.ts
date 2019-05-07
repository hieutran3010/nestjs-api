import { Global, Module } from '@nestjs/common';
import { MailerFactory } from './built-in-mailers/factory';
import { MailerConfigurationService } from './services/mailer-config.service';
import { MailerService } from './services/mailer.service';

@Global()
@Module({
    providers: [
        MailerConfigurationService, MailerFactory, MailerService
    ],
    exports: [MailerConfigurationService, MailerService],
})
export class MailerModule { }
