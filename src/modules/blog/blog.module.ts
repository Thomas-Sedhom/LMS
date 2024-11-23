import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../quiz/schema/quiz.schema';
import { CourseModule } from '../course/course.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { Blog, BlogSchema } from './schema/blog.schema';
import { FirebaseService } from '../../shared/services/firebase.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, FirebaseService],
  imports: [
    MongooseModule.forFeature([
      {name: Blog.name, schema: BlogSchema},
    ]),
    AuthModule,
    JwtModule
  ]
})
export class BlogModule {}
