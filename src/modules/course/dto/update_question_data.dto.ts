import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionTypeEnum } from '../../../common/enum/question.enum';

export class UpdateQuestionDataDto {
  @IsOptional()
  @IsString({message: "Question time must be a string"})
  @ApiProperty({ example: '55.60', description: 'Time of the question', type: String })
  questionTime?: string

  @IsOptional()
  @IsString({message: "Quiz number for the question must be a string"})
  @ApiProperty({ example: '2', description: 'Quiz number for the question', type: String })
  quizNumber?: string

  @IsOptional()
  @IsString({message: "Question type must be a string"})
  @ApiProperty({ example: 'mcq', description: 'Type of the question', type: String })
  questionType?: QuestionTypeEnum

  @IsOptional()
  @IsString({message: "Question must be a string"})
  @ApiProperty({ example: 'What is the summary of the last part ?', description: 'Question', type: String })
  question?: string

  @IsOptional()
  @IsString({message: "Choice 1 must be a string"})
  @ApiProperty({ example: 'Choice 1', description: 'Choices', type: String })
  choice1?: string;

  @IsOptional()
  @IsString({message: "Choice 2 must be a string"})
  @ApiProperty({ example: 'Choice 1', description: 'Choices', type: String })
  choice2?: string;

  @IsOptional()
  @IsString({message: "Choice 3 must be a string"})
  @ApiProperty({ example: 'Choice 3', description: 'Choices', type: String })
  choice3?: string;

  @IsOptional()
  @IsString({message: "Choice 4 must be a string"})
  @ApiProperty({ example: 'Choice 4', description: 'Choices', type: String })
  choice4?: string;

  @IsOptional()
  @IsString({message: "Answer of the choose question must be a string"})
  @ApiProperty({ example: '2', description: 'Answer of the choose question', type: String })
  chooseAnswer?: string;

  @IsOptional()
  @IsString({message: "Answer of the expressive question must be a string"})
  @ApiProperty({ example: 'The answer', description: 'Answer of the expressive question', type: String })
  expressiveAnswer?: number;

  @IsOptional()
  @IsString({message: "Answer of the paragraph question must be a string"})
  @ApiProperty({ example: 'The answer', description: 'Answer of the paragraph question', type: String })
  paragraphAnswer?: number;

  @IsOptional()
  @IsString({message: "Answer of the true or false question must be a string"})
  @ApiProperty({ example: 'true', description: 'Answer of the true or false question', type: String })
  trueFalseAnswer?: boolean ;

  @IsOptional()
  @IsString({message: "Answer of the complete question must be a string"})
  @ApiProperty({ example: 'true', description: 'Answer of the complete question', type: String })
  completeAnswer?: string;

  // @IsOptional()
  // @IsString({message: "Revision video data must be an object"})
  // @ApiProperty({ example: {}, description: 'Revision video data', type: VideoDto })
  // videoRevisionData: VideoDto;

  @Prop({
    required: true,
    default: () => new Date().toISOString()
  })
  creationDate: string
}