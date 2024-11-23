import mongoose from 'mongoose';

export interface CourseInterface {
  _id: mongoose.Types.ObjectId;
  courseName: string;
  description: string;
  whatYouLearn: string;
  coverImage: string;
  instructorId: mongoose.Types.ObjectId;
  videosId: mongoose.Types.ObjectId[];
  category: string;
  subCategory: string;
  createdDate: Date;
}