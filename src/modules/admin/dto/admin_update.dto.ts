import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @IsOptional()
  @IsString({message: "First name must be a string"})
  @ApiProperty({ example: 'John', description: 'First name of the admin', type: String })
  firstName?: string;

  @IsOptional()
  @IsString({message: "Last name must be a string"})
  @ApiProperty({ example: 'Doe', description: 'Last name of the admin', type: String })
  lastName?: string;

  @IsOptional()
  @IsString({message: "Email must be a string"})
  // allow_display_name: Allows email addresses with display names like John Doe <john@example.com>.
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'john@example.com', description: 'Email of the admin', type: String })
  email?: string;

  @IsOptional()
  @IsString({message: "Password must be a string"})
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|_<>-])(?=.*[a-zA-Z\d]).{8,}$/, {
    message: 'Password must be at least 8 characters long, include at least one uppercase letter, and one symbol',
  })
  @ApiProperty({ example: 'Rm-24222682', description: 'Password of the admin', type: String })
  password?: string;

  @IsOptional()
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the admin', type: String })
  phone?: string;
}