import mongoose from 'mongoose';
import { QuestionTypeEnum } from '../../../common/enum/question.enum';
import { Prop } from '@nestjs/mongoose';
import { VideoDto } from '../dto/video.dto';

export interface QuestionInterface {
  _id: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId
  questionTime: string
  questionType: QuestionTypeEnum
  question: string
  choice1?: string;
  choice2?: string;
  choice3?: string;
  choice4?: string;
  chooseAnswer?: string;
  expressiveAnswer?: number;
  paragraphAnswer?: number;
  trueFalseAnswer?: boolean ;
  completeAnswer?: string;
  videoData: VideoDto
  videoRevisionId?: mongoose.Types.ObjectId;
  creationDate: string
}