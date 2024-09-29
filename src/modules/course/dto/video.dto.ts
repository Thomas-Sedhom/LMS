import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @IsNotEmpty({message: "Course description is required"})
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoId: string;

  @IsNotEmpty({message: "Course description is required"})
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoTitle: string;

  @IsNotEmpty({message: "Course description is required"})
  @IsString({message: "Course description must be a string"})
  @ApiProperty({ example: 'Backend course', description: 'Description of the course', type: String })
  videoDescription: string;

  @IsNotEmpty({message: "Video index is required"})
  @IsString({message: "Video index must be a string"})
  @ApiProperty({ example: '1', description: 'index of the video', type: String })
  index: string;

  @IsNotEmpty({message: "Video URL is required"})
  @IsString({message: "Video URL must be a string"})
  @ApiProperty({ example: 'url for video', description: 'url of the video', type: String })
  videoUrl: string;
}