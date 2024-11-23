import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from '../enrollment/schema/enrollment.schema';
import { Quiz, QuizSchema } from './schema/quiz.schema';
import { CourseModule } from '../course/course.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';

@Module({
  controllers: [QuizController],
  providers: [QuizService],
  imports: [
    MongooseModule.forFeature([
      {name: Quiz.name, schema: QuizSchema},
    ]),
    CourseModule,
    AuthModule,
    JwtModule
  ]
})
export class QuizModule {}
