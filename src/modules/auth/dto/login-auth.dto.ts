import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginAuthDto {
  @IsNotEmpty({message: "Email is required"})
  @IsString({message: "Email must be a string"})
  @ApiProperty({example: "john@example.com", description: "Email of the user", type: String})
  email: string;
  @IsNotEmpty({message: "Password is required"})
  @IsString({message: "Password must be a string"})
  @ApiProperty({ example: 'Rs24222682', description: 'Password of the user', type: String})
  password: string;
}