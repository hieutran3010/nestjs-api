import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../core/modules/configuration';
import { RequestContext } from '../context/request-context';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';
import { LingualUnauthorizedException } from './../../../core/exception/lingual-exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService,
                configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.authentication.jwtSecretKey,
        });
    }

    async validate(payload: JwtPayload, done: (error: Error, res: boolean | JwtPayload) => void) {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            return done(new LingualUnauthorizedException('unauthorized'), false);
        }

        RequestContext.setUserName(payload.username);
        done(null, payload);
    }
}