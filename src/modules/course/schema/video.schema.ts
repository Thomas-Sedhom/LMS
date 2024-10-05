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
    required: false,
    trim: true,
  })
  courseId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: "Video",
    index: true,
    required: false,
    trim: true,
  })
  mainVideoId?: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: "Question",
    index: true,
    required: false,
    trim: true,
  })
  questionsId?: [mongoose.Types.ObjectId];

  @Prop({
    required: true,
    default: () => new Date().toISOString()
  })
  uploadedAt: string
}
export const VideoSchema = SchemaFactory.createForClass(Video)

// Define a compound index on videoId and questionTime
VideoSchema.index({ videoId: 1, questionTime: 1 });