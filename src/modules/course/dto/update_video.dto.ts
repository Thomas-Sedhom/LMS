import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVideoDto {

  @IsOptional()
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoTitle?: string;

  @IsOptional()
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoDescription: string;

  @IsOptional()
  @IsString({message: "Video index must be a string"})
  @ApiProperty({ example: '1', description: 'index of the video', type: String })
  index: string;
}