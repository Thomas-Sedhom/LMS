import mongoose from 'mongoose';

export interface VideoInterface {
  _id: mongoose.Types.ObjectId;
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  courseId: mongoose.Types.ObjectId;
  questionsId: [mongoose.Types.ObjectId];
  uploadedAt: string
}