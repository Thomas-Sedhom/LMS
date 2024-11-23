import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInstructorDto {
  @IsOptional()
  @IsString({message: "First name must be a string"})
  @ApiProperty({ example: 'John', description: 'First name of the instructor', type: String })
  firstName?: string;

  @IsOptional()
  @IsString({message: "Last name must be a string"})
  @ApiProperty({ example: ' Doe', description: 'Last name of the instructor', type: String })
  lastName?: string;

  @IsOptional()
  @IsString({message: "Email must be a string"})
  // allow_display_name: Allows email addresses with display names like John Doe <john@example.com>.
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'john@example.com', description: 'Email of the instructor', type: String })
  email?: string;

  @IsOptional()
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the instructor', type: String })
  phone?: string;

  @IsOptional()
  @IsString({message: "Subject must be a string"})
  @ApiProperty({ example: 'Math', description: 'The subject of the instructor', type: String })
  subject?: string;

  @IsOptional()
  @IsString({message: "Specialization must be a string"})
  @ApiProperty({ example: 'Math', description: 'The Specialization of the instructor', type: String })
  specialization?: string;

  @IsOptional()
  @IsString({message: "Description must be a string"})
  @ApiProperty({ example: 'I have worked as an instructor'  , description: 'Phone of the user', type: String })
  description?: string;
}