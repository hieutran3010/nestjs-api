import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { LoggingService } from '../modules/logging/logging.service';
import { isNullOrEmptyOrUndefined } from '../utils';
import { MessageService } from './../../modules/message-pack/message.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private messageService: MessageService,
              private loggingService: LoggingService) {}
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = (exception instanceof HttpException) ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const request = ctx.getRequest();

    if (status === HttpStatus.INTERNAL_SERVER_ERROR &&
      !(exception instanceof HttpException)) {
      this.loggingService.logger.error('[INTERNAL_SERVER_ERROR] Exception: ', exception);
      response.status(status).json({
        statusCode: status,
        message: {
          statusCode: status,
          error: 'INTERNAL_SERVER_ERROR',
          message: this.messageService.getMessage('unhandle_exception'),
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      const httpException = exception as HttpException;
      this.handleHttpException(httpException, response, request, status);
    }
  }

  private handleHttpException(httpException: HttpException, response: any, request: any, status: HttpStatus) {
    const {
      error,
      messageCode,
      params
    } = httpException.message;

    let convertedMessage;

    if (!isNullOrEmptyOrUndefined(params)) {
      convertedMessage = this.messageService.getMessage(messageCode, ...params);
    } else {
      convertedMessage = this.messageService.getMessage(messageCode);
    }

    response.status(status).json({
      statusCode: status,
      message: {
        statusCode: status,
        error,
        message: convertedMessage,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
