import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PermissionControllerCollectService } from './app.service';
import { ConfigModule, DatabaseModule, LoggingModule, MailerModule, PubSubClientModule } from './core/modules';
import { ConfigService } from './core/modules/configuration';
import { LoggingService } from './core/modules/logging';
import { MailerConfigurationService } from './core/modules/mailer/services';
import { IPubSubConfig, PubSubConfigService } from './core/modules/pubsub.client/config';
import { PubSubParsingService } from './core/modules/pubsub.client/parser';
import { ServiceContainerModule } from './core/modules/service-container/module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { MessageService } from './modules/message-pack/message.service';
import { PermissionSchemeModule } from './modules/permission-scheme/module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { UserGroupModule } from './modules/user-group/module';
import { UserModule } from './modules/user/user.module';
import { PubSubGateway, PubsubMessageParser } from './pubsub';

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    MailerModule,
    ServiceContainerModule,
    AuthModule,
    UserModule,
    PermissionSchemeModule,
    PubSubClientModule,
    UserGroupModule,
    BranchModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    MessageService,
    PermissionControllerCollectService,
    PubsubMessageParser,
    PubSubGateway,
  ],
  exports: [PermissionControllerCollectService]
})
export class AppModule {
  logger: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly pubsubService: PubSubConfigService,
    private readonly pubSubMessageParser: PubsubMessageParser,
    private readonly pubsubParsingService: PubSubParsingService,
    private readonly mailerConfigService: MailerConfigurationService,
    loggingService: LoggingService,
  ) {

    this.configPubsub();
    this.configMailer();

    this.logger = loggingService.createLogger('AppModule');

    this.logger.info(
      `${this.configService.env.brandName} is started successfully in env = ${
       this. configService.env.name
      } on port = ${this.configService.env.port}`,
    );
  }

  private configPubsub() {
    const pubsubConfig: IPubSubConfig = {
      host: this.configService.socketConfig.host,
    };
    this.pubsubService.config = pubsubConfig;

    this.pubsubParsingService.parser = this.pubSubMessageParser;
  }

  private configMailer() {
    this.mailerConfigService.setConfig('src/config/mailer.yml');
  }
}
