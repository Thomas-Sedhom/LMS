import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuizDto {
  @IsNotEmpty({message: "Quiz number for the question is required"})
  @ApiProperty({ example: '2', description: 'Quiz number for the question', type: Number })
  quizNumber: number

  @IsNotEmpty({message: "grade is required"})
  @ApiProperty({ example: '3', description: 'Number of questions user answered correctly', type: Number })
  grade: number;
}