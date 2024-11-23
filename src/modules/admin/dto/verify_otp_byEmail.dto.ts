import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpByEmailDto {
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'thomassedhom97@gmail.com', description: 'Email of the admin', type: String })
  email: string;

  @IsNotEmpty({message: "Code is required"})
  @IsString({message: "Code must be a string"})
  @ApiProperty({ example: '245698', description: 'OTP verification code', type: String })
  code: string;
}