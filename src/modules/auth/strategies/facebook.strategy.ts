import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile as FacebookProfile } from 'passport-facebook';
import { AuthService } from '../auth.service';


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback): Promise<any> {
    // console.log(accessToken, refreshToken, profile);
    const user = await this.authService.validateOAuthFacebookLogin(profile);
    done(null, user);
  }
}
