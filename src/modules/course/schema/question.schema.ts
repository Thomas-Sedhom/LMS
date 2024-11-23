import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import mongoose from 'mongoose';
import { QuestionTypeEnum } from '../../../common/enum/question.enum';
import { bool } from 'twilio/lib/base/serialize';
import { EnrollmentSchema } from '../../enrollment/schema/enrollment.schema';

@Schema()
export class Question {
  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    trim: true
  })
  videoId: mongoose.Types.ObjectId

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  questionTime: string

  @Prop({
    type: Number,
    required: true,
    trim: true
  })
  quizNumber: number

  @Prop({
    type: String,  // Use String for a single enum value
    enum: QuestionTypeEnum,  // Restrict to values of QuestionTypeEnum
    required: true,
    trim: true
  })
  questionType: QuestionTypeEnum;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  question: string

  @Prop({
    type: String,
    trim: true
  })
  choice1: string;

  @Prop({
    type: String,
    trim: true
  })
  choice2: string;

  @Prop({
    type: String,
    trim: true
  })
  choice3: string;

  @Prop({
    type: String,
    trim: true
  })
  choice4: string;

  @Prop({
    type: String,
    trim: true
  })
  chooseAnswer: string;

  @Prop({
    type: String,
    trim: true
  })
  expressiveAnswer: number;

  @Prop({
    type: String,
    trim: true
  })
  paragraphAnswer: number;

  @Prop({
    type: Boolean,
    trim: true,
  })
  trueFalseAnswer: boolean ;

  @Prop({
    type: String,
    trim: true,
  })
  completeAnswer: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: "Video",
    index: true,
    trim: true,
  })
  videoRevisionId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    default: () => new Date().toISOString()
  })
  creationDate: string
}
export const QuestionSchema = SchemaFactory.createForClass(Question)

QuestionSchema.index({ videoId: 1, quizNumber: 1 });
