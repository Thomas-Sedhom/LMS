import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import mongoose from 'mongoose';

@Schema()
export class Course {
  @Prop({
    type: String,
    required: true,
    trim: true
  })
  courseName: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  whatYouLearn: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  coverImage: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  category: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  subCategory: string;


  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Instructor",
    index: true,
    trim: true,
  })
  instructorId: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: "Video",
    index: true,
    trim: true,
  })
  videosId: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    default: () => new Date()
  })
  createdDate: Date;
}
export const CourseSchema =SchemaFactory.createForClass(Course)