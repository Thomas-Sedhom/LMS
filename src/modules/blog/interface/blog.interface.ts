import mongoose from 'mongoose';

export interface Blog {
  _is: mongoose.Types.ObjectId;
  title: string;
  details: string;
  image: string;
}