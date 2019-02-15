import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/exception';
import { ConfigService } from './core/modules/configuration/config.service';
import { LoggingService } from './core/modules/logging/logging.service';
import { ValidationPipe } from './core/validation/validation.pipe';
import {
  createSnorbsNamespace,
  initializeRequestContext,
} from './modules/auth/context/request-context';
import { AuthService } from './modules/auth/services/auth.service';
import { JwtAuthGuard } from './modules/auth/strategy/jwt-auth-guard';
import { IRoleValidator } from './modules/auth/strategy/role-validator.interface';
import { MessageService } from './modules/message-pack/message.service';
import { SchedulerManager } from './modules/scheduler/scheduler-manager';

async function bootstrap() {
  const configService = new ConfigService(
    `src/config/${process.env.NODE_ENV}.env`,
  );

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const messageService = app.get<MessageService>(MessageService);
  messageService.initialize();

  const schedulerManager = app.get<SchedulerManager>(SchedulerManager);
  schedulerManager.initialize();

  const loggingService = app.get<LoggingService>(LoggingService);

  app.useGlobalFilters(new HttpExceptionFilter(messageService, loggingService));

  app.useGlobalPipes(new ValidationPipe());

  const authService = app.get<AuthService>(AuthService) as IRoleValidator;
  // Initialize global JWT auth guard
  app.useGlobalGuards(new JwtAuthGuard(authService));

  // Initialize request context
  const ns = createSnorbsNamespace();
  app.use(initializeRequestContext(ns));

  app.useStaticAssets(__dirname + '/static');
  app.setBaseViewsDir(__dirname + '/views');
  app.setViewEngine('jade');

  await app.listen(configService.env.port);
}
bootstrap();
