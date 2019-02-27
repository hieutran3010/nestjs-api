import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppConfigService } from './app.config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/exception';
import { LoggingService } from './core/modules/logging';
import { TaskSchedulerManager } from './core/modules/task-scheduler';
import { TaskSchedulerConfig } from './core/modules/task-scheduler/config/model';
import { CommonValidationPipe } from './core/validations';
import {
  createRequestNamespace,
  initializeRequestContext,
} from './modules/auth/context/request-context';
import { AuthService } from './modules/auth/services/auth.service';
import { JwtAuthGuard } from './modules/auth/strategy/jwt-auth-guard';
import { IRoleValidator } from './modules/auth/strategy/role-validator.interface';
import { MessageService } from './modules/message-pack/message.service';

async function bootstrap() {
  const configService = new AppConfigService(
    `src/config/${process.env.NODE_ENV}.env`,
  );

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const messageService = app.get<MessageService>(MessageService);
  messageService.initialize();

  const taskSchedulerConfig: TaskSchedulerConfig = {
    dbServer: configService.taskSchedulerConfig.dbServer,
    dbName: configService.taskSchedulerConfig.dbName,
    collectionName: configService.taskSchedulerConfig.collectionName
  };

  const schedulerManager = app.get<TaskSchedulerManager>(TaskSchedulerManager);
  schedulerManager.initialize(taskSchedulerConfig);

  const loggingService = app.get<LoggingService>(LoggingService);

  app.useGlobalFilters(new HttpExceptionFilter(messageService, loggingService));

  app.useGlobalPipes(new CommonValidationPipe());

  const authService = app.get<AuthService>(AuthService) as IRoleValidator;
  // Initialize global JWT auth guard
  app.useGlobalGuards(new JwtAuthGuard(authService));

  // Initialize request context
  const ns = createRequestNamespace();
  app.use(initializeRequestContext(ns));

  app.useStaticAssets(__dirname + '/static');
  app.setBaseViewsDir(__dirname + '/views');
  app.setViewEngine('jade');

  await app.listen(configService.env.port);
}
bootstrap();
