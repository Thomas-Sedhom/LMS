import mongoose from 'mongoose';

export interface VideoInterface {
  _id: mongoose.Types.ObjectId;
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  notes?: string;
  pdf?: string;
  courseId?: mongoose.Types.ObjectId;
  mainVideoId?: mongoose.Types.ObjectId;
  questionsId?: [mongoose.Types.ObjectId];
  index?: string;
  uploadedAt: string;
}