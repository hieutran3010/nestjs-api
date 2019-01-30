import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { ConfigService } from '../../../core/modules/configuration/config.service';
import { ResetPasswordConstant } from '../constant/reset-password.constant';
import { AuthService } from '../services/auth.service';
import { SignedUser } from './../dto/signed-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() body: SignedUser) {
    return await this.authService.login(body);
  }

  @Put(':id/logout')
  async logOut(@Param('id') id: any) {
    return await this.authService.logout(id);
  }

  @Post('token')
  async refreshToken(@Body()
  token: {
    username: string;
    refreshToken: string;
  }) {
    return await this.authService.refreshToken(token);
  }

  @Post('recover-password')
  async recoverPassword(@Body() data: { lang: string; email: string }) {
    const token = await this.authService.recoverPassword(data);
    return { token };
  }

  @Get('reset/:token')
  @Render('reset')
  async resetPassword(
    @Param('token') token,
    @Query() params: { lang: string },
  ) {
    return {
      lang: params.lang,
      title: `${this.configService.env.brandName} CMS Reset Password`,
      password:
        params.lang === 'vi'
          ? ResetPasswordConstant.PasswordPlaceholderVi
          : ResetPasswordConstant.PasswordPlaceholderEn,
      confirm:
        params.lang === 'vi'
          ? ResetPasswordConstant.ConfirmPlaceholderVi
          : ResetPasswordConstant.ConfirmPlaceholderEn,
      password_require:
        params.lang === 'vi'
          ? ResetPasswordConstant.PasswordRequireMessageVi
          : ResetPasswordConstant.PasswordRequireMessageEn,
      confirm_require:
        params.lang === 'vi'
          ? ResetPasswordConstant.ConfirmRequireMessageVi
          : ResetPasswordConstant.ConfirmRequireMessageEn,
      password_match:
        params.lang === 'vi'
          ? ResetPasswordConstant.PasswordMatchMessageVi
          : ResetPasswordConstant.PasswordMatchMessageEn,
    };
  }

  @Post('reset/:token')
  async updatePassword(
    @Res() res,
    @Param('token') token,
    @Query() params: { lang: string },
    @Body() body: { password: string; confirm: string },
  ) {
    const user = await this.authService.getUserByResetToken(token);
    let relativeUrl = '';
    if (!user) {
      relativeUrl = `/auth/reset-result/failed?lang=${params.lang}`;
    } else {
      await this.authService.resetPassword(
        user._id,
        body.password,
        body.confirm,
      );

      relativeUrl = `/auth/reset-result/success?lang=${params.lang}`;
    }

    res.redirect(relativeUrl);
  }

  @Get('reset-result/:result')
  @Render('reset-result')
  async getResetPasswordResult(
    @Param() param: { result: string },
    @Query() params: { lang: string },
  ) {
    if (param.result === 'success') {
      return {
        title: `${this.configService.env.brandName} CMS RESET PASSWORD`,
        result: param.result,
        cms: this.configService.adminConfig.cmsGuiUrl,
        message:
          params.lang === 'vi'
            ? ResetPasswordConstant.ResetPasswordSuccessVi
            : ResetPasswordConstant.ResetPasswordSuccessEn,
      };
    } else {
      return {
        title: `${this.configService.env.brandName} CMS RESET PASSWORD`,
        result: param.result,
        cms: this.configService.adminConfig.cmsGuiUrl,
        message:
          params.lang === 'vi'
            ? ResetPasswordConstant.ResetPasswordFailedVi
            : ResetPasswordConstant.ResetPasswordFailedEn,
      };
    }
  }
}
