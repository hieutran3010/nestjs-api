import { ExecutionContext, HttpService, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { equals, filter, head } from 'ramda';
import { ConfigService } from '../../../core/modules/configuration/config.service';
import { MailerService } from '../../../core/modules/mailer/services/mailer.service';
import { IPermissionControlller } from '../../../core/permission/common';
import { metadataKeys } from '../../../core/permission/constant';
import { Guid, Hash, isNullOrEmptyOrUndefined } from '../../../core/utils';
import { controllerFields } from '../../../documents/permission-controller.document';
import { PermissionDetailFields } from '../../../documents/permission-detail.document';
import { PermissionFields } from '../../../documents/permission.document';
import { BasicUserInfo, UserDto } from '../../../documents/user.document';
import { MESSAGE_CODE } from '../../message-pack/languages/message-codes';
import { UserService } from '../../user/services/user.service';
import { ResetPasswordConstant } from '../constant/reset-password.constant';
import { SignedUser } from '../dto/signed-user.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AUTH_MESSAGE_CODE } from '../message.auth';
import { RestMethod } from '../model';
import {
  LingualBadRequestException,
  LingualForbiddenException,
  LingualUnauthorizedException,
} from './../../../core/exception-handling/exceptions/lingual-exception';
import { RecaptchaResponse } from './../interfaces/recaptcha-response.interface';
import { IRoleValidator } from './../strategy/role-validator.interface';

@Injectable()
export class AuthService implements IRoleValidator {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
  ) {}

  async login(signedUser: SignedUser) {
    // Verify user token
    await this.validateRecaptchaToken(signedUser.usertoken);

    const user = await this.userService.getUserByUsername(signedUser.username);
    if (user !== null && !isNullOrEmptyOrUndefined(user)) {
      // Account is deactive
      if (!user.isActive) {
        // Account exceeds limit login attempts
        this.userService.onLoginFailed(user);
        throw new LingualBadRequestException(AUTH_MESSAGE_CODE.AccountDeactive);
      }

      if (
        user.loginAttempts &&
        user.loginAttempts >= this.configService.authentication.limitLoginAttempts
      ) {
        // Account exceeds limit login attempts
        this.userService.onLoginFailed(user);
        throw new LingualBadRequestException(AUTH_MESSAGE_CODE.AccountBlocked, [
          this.configService.authentication.limitLoginAttempts,
        ]);
      }

      // Check password hash
      const isSamePassword = await Hash.compareHash(
        signedUser.password,
        user.passwordHash,
      );
      if (isSamePassword) {
        // Login success. Reset login attempts of user in database (async)
        await this.userService.onLoginSuccess(user);

        // Return login token
        return await this.createToken(user);
      }

      // Incorrect password
      await this.userService.onLoginFailed(user);
      const leftAttempts =
        this.configService.authentication.limitLoginAttempts - (user.loginAttempts + 1);
      throw new LingualBadRequestException(
        AUTH_MESSAGE_CODE.IncorrectPassword,
        [leftAttempts],
      );
    }

    // User name is incorrect
    throw new LingualBadRequestException(AUTH_MESSAGE_CODE.IncorrectUserName);
  }

  logout(userId: string) {
    // Clear refresh token of current user
    return this.userService.updateRefeshToken(userId, '');
  }

  validateUser(payload: JwtPayload) {
    return this.userService.getUserByUsername(payload.username);
  }

  async validateRecaptchaToken(userToken: string) {
    const url = `${this.configService.authentication.invisibleRecaptcha.verifyUrl}?secret=${
      this.configService.authentication.invisibleRecaptcha.secretKey
    }&response=${userToken}`;
    const recaptchaResponse = await this.httpService
      .get<RecaptchaResponse>(url)
      .toPromise();

    if (!recaptchaResponse.data.success) {
      throw new LingualBadRequestException(AUTH_MESSAGE_CODE.InvalidToken);
    }

    return { token: true };
  }

  async refreshToken(request: { username: string; refreshToken: string }) {
    const user = await this.userService.getUserByUsername(request.username);
    if (user !== null && !isNullOrEmptyOrUndefined(user)) {
      if (user.refreshToken === request.refreshToken) {
        // Generate new token
        return await this.createToken(user);
      }
    }

    // Have not yet authorized!!
    throw new LingualUnauthorizedException(MESSAGE_CODE.ForbiddenResource);
  }

  private async createToken(userDto: UserDto) {
    const user: JwtPayload = { username: userDto.username };
    const expiresIn = this.configService.authentication.tokenExpireIn;
    const jwtToken = jwt.sign(user, this.configService.authentication.jwtSecretKey, {
      expiresIn,
    });
    const decodeToken = jwt.decode(jwtToken, this.configService.authentication.jwtSecretKey);
    const refreshTokenValue = Guid.newGuid();

    // Update token for current user
    await this.userService.updateRefeshToken(userDto._id, refreshTokenValue);
    const permissions = await this.userService.getPermissionSchemeByUser(
      userDto,
    );
    const basicUserInfo = new BasicUserInfo(userDto);
    return {
      token: jwtToken,
      expireTime: decodeToken.exp,
      refreshToken: refreshTokenValue,
      user: basicUserInfo,
      permissions,
    };
  }

  async recoverPassword(data: { lang: string; email: string }) {
    const user = await this.userService.getUserByEmail(data.email);
    if (user) {
      const resetToken = await this.generateResetToken(user.username);

      // Store reset password to db
      await this.userService.updateResetToken(user._id, resetToken);

      // Generate reset password url
      const domain = this.configService.env.domain;
      const port = this.configService.env.port;
      const resetUrl = `${domain}:${port}/auth/reset/${resetToken}?lang=${
        data.lang
      }`;

      // Send email
      this.sendResetPasswordMail(user, resetUrl, data.lang);

      return resetUrl;
    }

    return null;
  }

  private async sendResetPasswordMail(
    userDto: UserDto,
    link: string,
    lang: string,
  ) {
    const receive =
      lang === 'vi'
        ? ResetPasswordConstant.EmailReceiveMessageVi
        : ResetPasswordConstant.EmailReceiveMessageEn;
    const email = {
      to: userDto.email,
      subject: `${this.configService.env.brandName} CMS RESET PASSWORD`,
      template: 'reset-password',
      context: {
        username: userDto.username,
        cmslink: this.configService.adminConfig.cmsGuiUrl,
        email: userDto.email,
        password: userDto.password,
        link,
        receive:
          lang === 'vi'
            ? ResetPasswordConstant.EmailReceiveMessageVi
            : ResetPasswordConstant.EmailReceiveMessageEn,
        click:
          lang === 'vi'
            ? ResetPasswordConstant.EmailClickMessageVi
            : ResetPasswordConstant.EmailClickMessageEn,
        valid:
          lang === 'vi'
            ? ResetPasswordConstant.EmailValidMessageVi
            : ResetPasswordConstant.EmailValidMessageEn,
        ignore:
          lang === 'vi'
            ? ResetPasswordConstant.EmailIgnoreMessageVi
            : ResetPasswordConstant.EmailIgnoreMessageEn,
        thank:
          lang === 'vi'
            ? ResetPasswordConstant.EmailThankMessageVi
            : ResetPasswordConstant.EmailThankMessageEn,
      },
    };

    await this.mailerService.sendMailWithTemplate(email);
  }

  async getUserByResetToken(token: string): Promise<UserDto> {
    return await this.userService.getUserByResetToken(token);
  }

  async resetPassword(id: any, password: string, confirm: string) {
    return await this.userService.updatePassword(id, password);
  }

  async hasPermission(username: string, context: ExecutionContext) {
    const controller = context.getClass();
    const permissionMetadata = Reflect.getMetadata(
      metadataKeys.PERMISSION,
      controller,
    ) as IPermissionControlller;
    if (permissionMetadata) {
      // check can access to controller
      const controllerCode = permissionMetadata.key;
      const user = await this.userService.getUserByUsername(username);
      if (!user) {
        throw new LingualForbiddenException(
          AUTH_MESSAGE_CODE.IncorrectUserName,
        );
      }

      const userPermissionScheme = await this.userService.getPermissionSchemeByUser(
        user,
      );
      if (!userPermissionScheme) {
        throw new LingualForbiddenException(AUTH_MESSAGE_CODE.NotAllow);
      }

      const controllers =
        userPermissionScheme[PermissionFields.PERMISSION_DETAIL];
      if (isNullOrEmptyOrUndefined(controllers)) {
        throw new LingualForbiddenException(AUTH_MESSAGE_CODE.NotAllow);
      }

      const permissionDetail = head(
        filter(
          c =>
            equals(
              c[PermissionDetailFields.CONTROLLER][controllerFields.KEY],
              controllerCode,
            ),
          controllers,
        ),
      );
      if (isNullOrEmptyOrUndefined(permissionDetail)) {
        throw new LingualForbiddenException(AUTH_MESSAGE_CODE.NotAllow);
      }

      const request = context.switchToHttp().getRequest();
      switch (request.method) {
        case RestMethod.GET:
          break;
        case RestMethod.POST:
          if (!permissionDetail[PermissionDetailFields.IS_INSERT]) {
            throw new LingualForbiddenException(
              AUTH_MESSAGE_CODE.NotAllowToInsert,
            );
          }
          break;
        case RestMethod.PATCH:
        case RestMethod.PUT:
          if (!permissionDetail[PermissionDetailFields.IS_UPDATE]) {
            throw new LingualForbiddenException(
              AUTH_MESSAGE_CODE.NotAllowToUpdate,
            );
          }
          break;
        case RestMethod.DELETE:
          if (!permissionDetail[PermissionDetailFields.IS_DELETE]) {
            throw new LingualForbiddenException(
              AUTH_MESSAGE_CODE.NotAllowToDelete,
            );
          }
          break;
      }
    }
  }

  private async generateResetToken(userName: string) {
    const ticks = new Date().getTime();
    const payload = { username: userName, ticks };
    const expiresIn = this.configService.authentication.tokenExpireIn;
    const token = jwt.sign(payload, this.configService.authentication.jwtSecretKey, {
      expiresIn,
    });

    // return token;
    return token.replace('.', '');
  }
}
