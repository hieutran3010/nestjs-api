import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PubSubGateway } from './app.pubsub.gateway';
import { AppService, PermissionControllerCollectService } from './app.service';
import { ConfigModule } from './core/modules/configuration/config.module';
import { ConfigService } from './core/modules/configuration/config.service';
import { DatabaseMigrationModule } from './core/modules/database-migration/database-migration.module';
import { DatabaseSeedingModule } from './core/modules/database-seeder/module';
import { DatabaseModule } from './core/modules/database/database.module';
import { CatsModule } from './core/modules/database/test/cat.module';
import { LoggingModule } from './core/modules/logging/logging.module';
import { LoggingService } from './core/modules/logging/logging.service';
import { MailerModule } from './core/modules/mailer/mailer.module';
import { MailerConfigurationService } from './core/modules/mailer/services/mailer-config.service';
import { IPubSubConfig, PubSubConfigService } from './core/modules/pubsub.client/config';
import { PubSubParsingService } from './core/modules/pubsub.client/parser';
import { PubSubClientModule } from './core/modules/pubsub.client/pubsub-client.module';
import { ServiceContainerModule } from './core/modules/service-container/module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { MessageService } from './modules/message-pack/message.service';
import { PermissionSchemeModule } from './modules/permission-scheme/module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { UserGroupModule } from './modules/user-group/module';
import { UserModule } from './modules/user/user.module';
import { PubsubMessageParser } from './pubsub.message-parser';

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    DatabaseSeedingModule,
    DatabaseMigrationModule,
    MailerModule,
    ServiceContainerModule,
    CatsModule,
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
    AppService,
    MessageService,
    PermissionControllerCollectService,
    PubsubMessageParser,
    PubSubGateway,
  ],
  exports: [PermissionControllerCollectService]
})
export class AppModule {
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

    loggingService.logger.info(
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
