import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { QuestionDto } from '../dto/question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from '../schema/question.schema';
import { VideoService } from './video.service';
import { UpdateQuestionDataDto } from '../dto/update_question_data.dto';
import { VideoInterface } from '../interface/video.interface';
import { QuestionInterface } from '../interface/question.interface';

@Injectable()
export class QuestionService {

  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    private readonly videoService: VideoService,
    ) {}

  async createQuestion(videoId: string, questionDTO: QuestionDto): Promise<any> {
    let session = await this.questionModel.startSession()
    session.startTransaction()
    try{
      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId)
      const question = await this.questionModel.create([{ ...questionDTO, videoId: id }], {session})
      const video = await this.videoService.getVideoById(videoId);
      video.questionsId.push(question[0]._id);
      await video.save({ session });
      await session.commitTransaction()
      return question
    }catch (err){
      await session.abortTransaction();
      throw err; // Rethrow the error to propagate it upwards
    }finally{
      await session.endSession()
    }
  }
  async getQuestion(questionId: string): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(questionId);
    const question = await this.questionModel
      .findById(id)
      .populate(
        {
          path: "videoRevisionId",
          select: "_id videoId videoTitle videoDescription index videoUrl uploadedAt"
        },
      )
    return question;
  }

  async getQuestionsForSpecificQuiz(quizNumber: Number, videoId: string): Promise<any> {

    const video_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
    const questions = await this.questionModel.find({videoId: video_id, quizNumber});
    return questions.length;
  }

  async updateQuestionData(questionId: string, updateQuestionDataDto: UpdateQuestionDataDto):Promise<VideoInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(questionId);
    const video: VideoInterface = await this.questionModel.findByIdAndUpdate(id, updateQuestionDataDto, {new: true});
    return video;
  }


  async deleteQuestion(questionId: string):  Promise<QuestionInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(questionId);
    const session = await this.questionModel.startSession();
    session.startTransaction()
    try{
      const question = await this.questionModel.findByIdAndDelete(id, {session});
      const videoIdAsString: string = question.videoId.toString();
      const video: any = await this.videoService.getVideoById(videoIdAsString);
      video.questionsId = video.questionsId.filter((
        questionId: mongoose.Types.ObjectId) => !questionId.equals(id)
      );
      await video.save({session})// Use equals for ObjectId comparison});
      const anyQuestion: VideoInterface[] = await this.questionModel.find({
        videoId:question.videoId,
        questionTime: question.questionTime
      })
      const revisionVideoId: string = question.videoRevisionId.toString();
      if(anyQuestion.length == 1){
        const revisionQuestion = await this.videoService.getVideoById(revisionVideoId);
        const ids: string[] = [revisionQuestion.videoId];
        await this.videoService.removeVideoFromDBForTask(ids);
        await this.videoService.deleteVideos(ids);
      }
      await session.commitTransaction();
      return question;
    }catch (err){
      await session.abortTransaction()
      throw err;
    }finally {
      await session.endSession();
    }
  }
}