import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CourseDto {
  @IsNotEmpty({message: "Course name is required"})
  @IsString({message: "Course name must be a string"})
  @ApiProperty({ example: 'course1', description: 'Name of the course', type: String })
  courseName: string;

  @IsNotEmpty({message: "Course description is required"})
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  description: string;

  @IsNotEmpty({message: "What will you learn input is required"})
  @IsString({message: "What will you learn must be a string"})
  @ApiProperty({ example: 'You will learn NodeJs & NestJs', description: 'What you will learn of the course', type: String })
  whatYouLearn: string;

  @IsNotEmpty({message: "Category is required"})
  @IsString({message: "Category must be a string"})
  @ApiProperty({ example: 'secondary', description: 'Category of the course', type: String })
  category: string;

  @IsNotEmpty({message: "Sub category is required"})
  @IsString({message: "Sub category must be a string"})
  @ApiProperty({ example: 'Sub secondary', description: 'Sub category of the course', type: String })
  subCategory: string;

  @IsOptional()
  coverImage: string;
}