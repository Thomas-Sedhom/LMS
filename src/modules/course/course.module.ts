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
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { AuthModule } from '../auth/auth.module';
import { InstructorModule } from '../instructor/instructor.module';
import { AdminService } from '../admin/admin.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Video.name, schema: VideoSchema},
      {name: Course.name, schema: CourseSchema},
      {name: Question.name, schema: QuestionSchema},
    ]),
    HttpModule,
    JwtModule,
    AuthModule,
    InstructorModule,
    AdminModule
  ], // Add HttpModule here
  controllers: [CourseController],
  providers: [CourseService, VideoCipherService, VideoService, FirebaseService, QuestionService],
  exports: [CourseService, VideoService, QuestionService]
})
export class CourseModule {}
