import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVideoDto {

  @IsOptional()
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoId?: string;

  @IsOptional()
  @IsString({message: "Video URL must be a string"})
  @ApiProperty({ example: 'url for video', description: 'url of the video', type: String })
  videoUrl?: string;
}