import { HttpException, HttpStatus } from '@nestjs/common';

export class LingualHttpException extends HttpException {
    constructor(messageCode: string, status?: number, params?: any[]) {
        const message = {messageCode, params};
        super(message, status);
      }
}

export class LingualForbiddenException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.FORBIDDEN, params);
    }
}

export class LingualBadRequestException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.BAD_REQUEST, params);
    }
}

export class LingualUnauthorizedException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.UNAUTHORIZED, params);
    }
}

export class LingualNotFoundException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.NOT_FOUND, params);
    }
}

export class LingualNotAcceptableException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.NOT_ACCEPTABLE, params);
    }
}

export class LingualRequestTimeoutException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.REQUEST_TIMEOUT, params);
    }
}

export class LingualConflictException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.CONFLICT, params);
    }
}

export class LingualGoneException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.GONE, params);
    }
}

export class LingualPayloadTooLargeException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.PAYLOAD_TOO_LARGE, params);
    }
}

export class LingualUnsupportedMediaTypeException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.UNSUPPORTED_MEDIA_TYPE, params);
    }
}

export class LingualUnprocessableException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.UNPROCESSABLE_ENTITY, params);
    }
}

export class LingualInternalServerErrorException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.INTERNAL_SERVER_ERROR, params);
    }
}

export class LingualNotImplementedException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.NOT_IMPLEMENTED, params);
    }
}

export class LingualBadGatewayException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.BAD_GATEWAY, params);
    }
}

export class LingualServiceUnavailableException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.SERVICE_UNAVAILABLE, params);
    }
}

export class LingualGatewayTimeoutException extends LingualHttpException {
    constructor(messageCode: string, params?: any[]) {
      super(messageCode, HttpStatus.GATEWAY_TIMEOUT, params);
    }
}