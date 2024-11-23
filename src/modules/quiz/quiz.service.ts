import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Enrollment } from '../enrollment/schema/enrollment.schema';
import { Quiz } from './schema/quiz.schema';
import { EnrollmentInterface } from '../enrollment/interface/enrollment.interface';
import { QuizDto } from './dto/quiz.dto';
import { QuizInterface } from './interface/quiz.interface';
import { QuestionService } from '../course/service/question.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    private readonly questionService: QuestionService,
    ) {}

  async enrollNewQuiz(studentId: string,courseId: string, videId: string, quizDto: QuizDto): Promise<any> {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const video_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const quizQuestions = await this.questionService.getQuestionsForSpecificQuiz(quizDto.quizNumber, videId);
    const grade = (quizDto.grade / quizQuestions) * 100;
    const quiz = await this.quizModel.create({
      studentId: student_id,
      videoId: video_id,
      courseId: course_id,
      grade,
      quizNumber: quizDto.quizNumber
    })
    return quiz;
  }

  async getAllQuizzesForStudent(studentId: string): Promise<any> {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const quiz = await this.quizModel
      .find({studentId: student_id})
      .populate({
        path: 'courseId',
        select: '_id courseName'
      });
    return quiz
  }
}
