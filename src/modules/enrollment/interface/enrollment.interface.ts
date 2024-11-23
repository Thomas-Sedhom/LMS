import { Prop } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { StatusEnum } from '../enums/status.enum';

export interface EnrollmentInterface {
  _id: Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: string;
  grade: string;
  completionDate?: string;
}