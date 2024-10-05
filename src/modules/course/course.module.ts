import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './service/course.service';
import { VideoService } from './service/video.service';
import { VideoCipherService } from '../../shared/services/videoCipher.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schema/video.schema';
import { Course, CourseSchema } from './schema/course.schema';
import { FirebaseService } from '../../shared/services/firebase.service';
import { QuestionService } from './service/question.service';
import { Question, QuestionSchema } from './schema/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Video.name, schema: VideoSchema},
      {name: Course.name, schema: CourseSchema},
      {name: Question.name, schema: QuestionSchema},
    ]),
    HttpModule,
  ], // Add HttpModule here
  controllers: [CourseController],
  providers: [CourseService, VideoCipherService, VideoService, FirebaseService, QuestionService]
})
export class CourseModule {}
