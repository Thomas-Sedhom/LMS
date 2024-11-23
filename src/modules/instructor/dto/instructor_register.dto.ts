import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstructorRegisterDto {
  @IsNotEmpty({message: "First name is required"})
  @IsString({message: "First name must be a string"})
  @ApiProperty({ example: 'John', description: 'First name of the instructor', type: String })
  firstName: string;

  @IsNotEmpty({message: "Last name is required"})
  @IsString({message: "Last name must be a string"})
  @ApiProperty({ example: ' Doe', description: 'Last name of the instructor', type: String })
  lastName: string;

  @IsNotEmpty({message: "Email is required"})
  @IsString({message: "Email must be a string"})
  // allow_display_name: Allows email addresses with display names like John Doe <john@example.com>.
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'john@example.com', description: 'Email of the instructor', type: String })
  email: string;

  @IsNotEmpty({message: "Password is required"})
  @IsString({message: "Password must be a string"})
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|_<>-])(?=.*[a-zA-Z\d]).{8,}$/, {
    message: 'Password must be at least 8 characters long, include at least one uppercase letter, and one symbol',
  })
  @ApiProperty({ example: 'Rm-24222682', description: 'Password of the instructor', type: String })
  password: string;

  @IsNotEmpty({message: "Phone is required"})
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the instructor', type: String })
  phone: string;

  @IsNotEmpty({message: "Subject is required"})
  @IsString({message: "Subject must be a string"})
  @ApiProperty({ example: 'Math', description: 'The subject of the instructor', type: String })
  subject: string;

  @IsNotEmpty({message: "Specialization is required"})
  @IsString({message: "Specialization must be a string"})
  @ApiProperty({ example: 'Math', description: 'The Specialization of the instructor', type: String })
  specialization: string;

  @IsNotEmpty({message: "Description is required"})
  @IsString({message: "Description must be a string"})
  @ApiProperty({ example: 'I have worked as an instructor'  , description: 'Phone of the user', type: String })
  description: string;

  registrationDate: Date;
}