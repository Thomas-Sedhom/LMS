import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @IsOptional()
  @IsString({message: "First name must be a string"})
  @ApiProperty({ example: 'John', description: 'First name of the student', type: String })
  firstName: string;

  @IsOptional()
  @IsString({message: "Last name must be a string"})
  @ApiProperty({ example: ' Doe', description: 'Last name of the student', type: String })
  lastName: string;

  @IsOptional()
  @IsString({message: "Phone must be a string"})
  @ApiProperty({ example: '+201003428624', description: 'Phone of the student', type: String })
  phone: string;

}