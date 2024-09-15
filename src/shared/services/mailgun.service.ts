import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VerifyOtpByEmailDto } from '../../modules/auth/dto/verify-otp-by-email.dto';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MailgunService {
  private mailgunClient: any;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService
  ) {
    const MAILGUN_API_KEY = this.configService.get<string>('MAILGUN_API_KEY');
    const mailgun = new Mailgun(formData);
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: MAILGUN_API_KEY,
    });
  }

  async sendOtpEmail(to: string, otpCode: string) {
    const MAILGUN_DOMAIN = this.configService.get<string>('MAILGUN_DOMAIN');

    try {
      const messageData = {
        from: 'Excited User <mailgun@YOUR_DOMAIN_NAME>',
        to: [to],
        subject: "AutMessage",
        text: otpCode,
      };

      const response = await this.mailgunClient.messages.create(MAILGUN_DOMAIN, messageData);
      console.log('Email sent:', response);
      await this.cacheManager.set(`pass-${to}`, otpCode);

      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  async verifyOtpVerification(verifyOtp: VerifyOtpByEmailDto): Promise<any> {
    const cachedOtp = await this.cacheManager.get(`pass-${verifyOtp.email}`)
    console.log(cachedOtp)
    if(cachedOtp && cachedOtp === verifyOtp.code){
      return true
    }else{
      throw new UnauthorizedException("Wrong OTP code");
    }
  }
}