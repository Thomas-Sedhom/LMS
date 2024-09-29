import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import mongoose from 'mongoose';

@Schema()
export class Video {
  @Prop({
    type: String,
    required: true,
    index: true,
    trim: true
  })
  videoId: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  videoTitle: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  videoDescription: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  index: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  videoUrl: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: "Course",
    index: true,
    required: true,
    trim: true,
  })
  courseId: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: "Question",
    index: true,
    trim: true,
  })
  questionsId: [mongoose.Types.ObjectId];

  @Prop({
    required: true,
    default: () => new Date().toISOString()
  })
  uploadedAt: string
}
export const VideoSchema = SchemaFactory.createForClass(Video)