import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @IsNotEmpty({message: "Name is required"})
  @IsString({message: "Name must be a string"})
  @ApiProperty({example: "John khaled", description: "Name of the user", type: String})
  name: string;

  @IsNotEmpty({message: "Email is required"})
  @IsString({message: "Email must be a string"})
  @IsEmail({allow_display_name: true},{message: "Please enter a valid email address"})
  @ApiProperty({ example: 'john@example.com', description: 'Email of the user', type: String })
  email: string;

  @IsNotEmpty({message: "Message is required"})
  @IsString({message: "Message must be a string"})
  @ApiProperty({example: "Message", description: "Message which sent", type: String})
  message: string;
}