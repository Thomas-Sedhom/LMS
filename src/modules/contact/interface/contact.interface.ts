import mongoose from 'mongoose';

export interface ContactInterface {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  studentId: mongoose.Types.ObjectId;
}