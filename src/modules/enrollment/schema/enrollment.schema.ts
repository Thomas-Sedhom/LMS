import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { StatusEnum } from '../enums/status.enum';

@Schema({ timestamps: true })  // This will automatically add createdAt and updatedAt fields
export class Enrollment {

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true ,
  })
  studentId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Course',
    index: true,
    required: true
  })
  courseId: mongoose.Types.ObjectId;

  @Prop({
    type: Boolean,
    default: false
  })
  active: boolean;

  @Prop({
    type: String,
    enum: StatusEnum,
    default: 'active'
  })
  status: string;

  @Prop({
    required: false,
    type: String,
    default: '0'
  })
  grade: string;

  @Prop({
    required: false,
    type: String,
    default: 0,
  })
  progress: Number;

  @Prop({
    required: false,
    type: String
  })
  completionDate: string;
}

// Create the schema
export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

EnrollmentSchema.index({ studentId: 1, courseId: 1 });
EnrollmentSchema.index({ studentId: 1 });
EnrollmentSchema.index({ courseId: 1 });
