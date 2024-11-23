import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPassDto {
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'thomassedhom97@gmail.com', description: 'Email of the user', type: String })
  email: string;
  @IsNotEmpty({message: "Password is required"})
  @IsString({message: "Password must be a string"})
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|_<>-])(?=.*[a-zA-Z\d]).{8,}$/, {
    message: 'Password must be at least 8 characters long, include at least one uppercase letter, and one symbol',
  })
  @ApiProperty({ example: 'Rm-24222682', description: 'Password of the user', type: String })
  password: string;
}