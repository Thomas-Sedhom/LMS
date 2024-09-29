import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @IsOptional()
  @IsString({message: "Course name must be a string"})
  @ApiProperty({ example: 'course1', description: 'Name of the course', type: String })
  courseName?: string;

  @IsOptional()
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  description?: string;

  @IsOptional()
  @IsString({message: "What will you learn must be a string"})
  @ApiProperty({ example: 'You will learn NodeJs & NestJs', description: 'What you will learn of the course', type: String })
  whatYouLearn?: string;

  @IsOptional()
  @IsString({message: "Video index must be a string"})
  @ApiProperty({ example: '1', description: 'index of the video', type: String })
  index?: string;

  @IsOptional()
  coverImage?: string;
}