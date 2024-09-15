import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { VerifyOtpByPhoneDto } from '../../modules/auth/dto/verify-otp-by-phone.dto';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = Twilio(accountSid, authToken);
  }

  // Method to send OTP via WhatsApp
  async sendOtp(to: string, channel: 'sms' | 'whatsapp' = 'sms') {
    const serviceSid = this.configService.get<string>('TWILIO_SERVICE_SID');
    const formattedTo = channel === 'whatsapp' ? `whatsapp:${to}` : to;
    try {
      const verification = await this.client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: formattedTo, channel });
      return verification.sid;
    } catch (err) {
      throw new Error(`Failed to send OTP: ${err.message}`);
    }
  }

  // Method to verify OTP
  async verifyOtp(otp: VerifyOtpByPhoneDto, channel: 'sms' | 'whatsapp' = 'sms') {
    const to = otp.phone;
    const code = otp.code;
    const serviceSid = this.configService.get<string>('TWILIO_SERVICE_SID');
    const formattedTo = channel === 'whatsapp' ? `whatsapp:${to}` : to;
    try {
      const verificationCheck = await this.client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: formattedTo, code });
      return verificationCheck.status;
    } catch (err) {
      throw new Error(`Failed to verify OTP: ${err.message}`);
    }
  }
}