import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterAuthDto {
  @IsNotEmpty({message: "First name is required"})
  @IsString({message: "First name must be a string"})
  @ApiProperty({ example: 'John', description: 'First name of the user', type: String })
  firstName: string;

  @IsNotEmpty({message: "Last name is required"})
  @IsString({message: "Last name must be a string"})
  @ApiProperty({ example: ' Doe', description: 'Last name of the user', type: String })
  lastName: string;

  @IsNotEmpty({message: "Email is required"})
  @IsString({message: "Email must be a string"})
  // allow_display_name: Allows email addresses with display names like John Doe <john@example.com>.
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'john@example.com', description: 'Email of the user', type: String })
  email: string;

  @IsNotEmpty({message: "Password is required"})
  @IsString({message: "Password must be a string"})
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|_<>-])(?=.*[a-zA-Z\d]).{8,}$/, {
    message: 'Password must be at least 8 characters long, include at least one uppercase letter, and one symbol',
  })
  @ApiProperty({ example: 'Rm-24222682', description: 'Password of the user', type: String })
  password: string;

  @IsNotEmpty({message: "Phone is required"})
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the user', type: String })
  phone: string;

  registrationDate: Date;
}