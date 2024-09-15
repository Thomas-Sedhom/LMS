import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpByPhoneDto {
  @IsNotEmpty({message: "Phone is required"})
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the user', type: String })
  phone: string;
  @IsNotEmpty({message: "Code is required"})
  @IsString({message: "Code must be a string"})
  @ApiProperty({ example: '245698', description: 'OTP verification code', type: String })
  code: string;
}