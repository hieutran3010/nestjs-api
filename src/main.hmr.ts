import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { JwtAuthGuard } from 'modules/auth/strategy/jwt-auth-guard';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/exception-handling/http-exception.filter';
import { ConfigService } from './core/modules/configuration/config.service';
import { LoggingService } from './core/modules/logging/logging.service';
import { ValidationPipe } from './core/validation/validation.pipe';
import {
  createSnorbsNamespace,
  initializeRequestContext,
} from './modules/auth/context/request-context';
import { AuthService } from './modules/auth/services/auth.service';
import { IRoleValidator } from './modules/auth/strategy/role-validator.interface';
import { MessageService } from './modules/message-pack/message.service';

declare const module: any;

async function bootstrap() {
  const configService = new ConfigService(
    `src/config/${process.env.NODE_ENV}.env`,
  );

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(bodyParser.json());

  const messageService = app.get<MessageService>(MessageService);
  messageService.initialize();

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

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
