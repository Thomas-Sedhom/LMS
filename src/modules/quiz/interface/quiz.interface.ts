import mongoose from 'mongoose';

export interface QuizInterface {
  _id?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  videoId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  quizNumber?: number;
  grade?: number;
}