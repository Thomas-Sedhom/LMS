import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })  // This will automatically add createdAt and updatedAt fields
export class Quiz {

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
    required: true ,
  })
  courseId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Video',
    index: true,
    required: true
  })
  videoId: mongoose.Types.ObjectId;

  @Prop({
    type: Number,
    required: true
  })
  quizNumber: number;

  @Prop({
    required: false,
    type: Number,
    default: 0
  })
  grade: number;
}

// Create the schema
export const QuizSchema = SchemaFactory.createForClass(Quiz);

