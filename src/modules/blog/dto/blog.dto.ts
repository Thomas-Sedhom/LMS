import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlogDto {
  @IsNotEmpty({message: "Title of the blog is required"})
  @ApiProperty({ example: 'Title', description: 'Title of the blog', type: String })
  title: string

  @IsNotEmpty({message: "Details fo the blog is required"})
  @ApiProperty({ example: 'Details', description: 'Details of the quiz', type: String })
  details: string;
}