import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogDto {
  @IsOptional()
  @ApiProperty({ example: 'Title', description: 'Title of the blog', type: String })
  title?: string

  @IsOptional()
  @ApiProperty({ example: 'Details', description: 'Details of the quiz', type: String })
  details?: string;
}