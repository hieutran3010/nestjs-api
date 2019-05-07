import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { defaultOptions } from '@nestjs/passport/dist/options';
import * as passport from 'passport';
import { contains } from 'ramda';
import { RequestContext } from '../context/request-context';
import { AuthController } from '../controllers/auth.controller';
import { AppController } from './../../../app.controller';
import { AUTH_METADATA_KEYS } from './decorators';
import { IRoleValidator } from './role-validator.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(protected roleValidator: IRoleValidator) {}

  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const [request, response] = [httpContext.getRequest(), httpContext.getResponse()];

    // Build request context
    RequestContext.buildRequestConext(request);

    // Determine request path in excludes whether or not
    if (this.isExcluded(context)) {
      // Skip to check authentication
      return true;
    }

    // Using passport to check authentication
    const passportFn = createPassportContext(request, response);
    const jwtStrategy = this.getJwtStrategy(context);
    request[defaultOptions.property] = await passportFn(jwtStrategy, defaultOptions);

    const username = RequestContext.currentRequestContext().username;

    await this.roleValidator.hasPermission(username, context);

    return true;
  }

  isExcluded(context: ExecutionContext): boolean {
    const controller = context.getClass();
    const excludeControllers = [
      AuthController.name,
      AppController.name,
    ];
    if (contains(controller.name, excludeControllers)) {
      return true;
    }

    return false;
  }

  getJwtStrategy(context: ExecutionContext) {
    let strategyName = 'jwt';

    const controller = context.getClass();

    const strategy = Reflect.getMetadata(
      AUTH_METADATA_KEYS.MULTI_JWT_STRATEGY,
      controller,
    );

    if (strategy && strategy !== '') {
      strategyName = strategy;
    }

    return strategyName;
  }
}

const createPassportContext = (request, response) => (type, options) =>
  new Promise((resolve, reject) =>
    passport.authenticate(type, options, (err, user, info) => {
      try {
        return resolve(options.callback(err, user, info));
      } catch (err) {
        reject(err);
      }
    })(request, response, resolve),
  );
