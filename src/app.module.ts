import { Global, Module } from '@nestjs/common';
import {
  AppConfigService,
  dbConfigProvider,
  loggingConfigProvider
} from './app.config';
import { AppController } from './app.controller';
import { PermissionControllerCollectService } from './app.service';
import {
  DatabaseModule,
  LoggingModule,
  MailerModule,
  PubSubClientModule,
  TaskSchedulerModule
} from './core/modules';
import { LoggingService } from './core/modules/logging';
import { MailerConfigurationService } from './core/modules/mailer/services';
import {
  IPubSubConfig,
  PubSubConfigService
} from './core/modules/pubsub.client/config';
import { PubSubParsingService } from './core/modules/pubsub.client/parser';
import { ServiceContainerModule } from './core/modules/service-container/module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { PermissionSchemeModule } from './modules/permission-scheme/module';
import ReportModule from './modules/report';
import { UserGroupModule } from './modules/user-group/module';
import { UserModule } from './modules/user/user.module';
import { MessageService } from './multilingual/message.service';
import { PubSubGateway, PubsubMessageParser } from './pubsub';
import { SettingModule } from './shared-modules/setting';
@Global()
@Module({
  imports: [
    MailerModule,
    ServiceContainerModule,
    LoggingModule.forRoot([loggingConfigProvider]),
    DatabaseModule.forRoot([dbConfigProvider]),
    AuthModule,
    UserModule,
    PermissionSchemeModule,
    PubSubClientModule,
    UserGroupModule,
    BranchModule,
    TaskSchedulerModule,
    ReportModule,
    SettingModule,
  ],
  controllers: [AppController],
  providers: [
    MessageService,
    PermissionControllerCollectService,
    PubsubMessageParser,
    PubSubGateway,
    {
      provide: AppConfigService,
      useValue: new AppConfigService(`src/config/${process.env.NODE_ENV}.env`)
    }
  ],
  exports: [PermissionControllerCollectService, AppConfigService]
})
export class AppModule {
  logger: any;

  constructor(
    private readonly configService: AppConfigService,
    private readonly pubsubService: PubSubConfigService,
    private readonly pubSubMessageParser: PubsubMessageParser,
    private readonly pubsubParsingService: PubSubParsingService,
    private readonly mailerConfigService: MailerConfigurationService,
    loggingService: LoggingService
  ) {
    this.configPubsub();
    this.configMailer();

    this.logger = loggingService.createLogger('AppModule');

    this.logger.info(
      `${this.configService.env.brandName} is started successfully in env = ${
        this.configService.env.name
      } on port = ${this.configService.env.port}`
    );
  }

  private configPubsub() {
    const pubsubConfig: IPubSubConfig = {
      host: this.configService.socketConfig.host
    };
    this.pubsubService.config = pubsubConfig;

    this.pubsubParsingService.parser = this.pubSubMessageParser;
  }

  private configMailer() {
    this.mailerConfigService.setConfig('src/config/mailer.yml');
  }
}
