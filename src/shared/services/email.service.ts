import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { VerifyOtpByEmailDto } from '../../modules/auth/dto/verify-otp-by-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async sendOtpEmail(to: string, otpCode: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'verification code',
        html: ` Hello,
      Thank you for registering with our application. To complete your registration, please use the following verification code: 
     <br><br>
      Verification Code: ${otpCode}
      <br><br>
      If you did not request this verification code, please ignore this email.

      Best regards,
      Your Application Team`
      })
      await this.cacheManager.set(`pass-${to}`, otpCode);

    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  async verifyOtpVerification(verifyOtp: VerifyOtpByEmailDto): Promise<any> {
    const cachedOtp = await this.cacheManager.get(`pass-${verifyOtp.email}`)
    if(cachedOtp && cachedOtp === verifyOtp.code){
      return true
    }else{
      throw new UnauthorizedException("Wrong OTP code");
    }
  }
}