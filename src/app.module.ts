import { Logger, Module } from '@nestjs/common';
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { JwtModule } from './shared/modules/jwt/jwt.module';
import { CacheModule } from "@nestjs/cache-manager";
import { MailerModule } from '@nestjs-modules/mailer';
import { CourseModule } from './modules/course/course.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { AdminModule } from './modules/admin/admin.module';
import { StudentModule } from './modules/student/student.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ContactModule } from './modules/contact/contact.module';
import { AiModule } from './modules/ai/ai.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './src/environment/.development.env',
      isGlobal: true,
    }),
    CacheModule.register({
      store: process.env.CACHE_STORE ,
      ttl: 1000*60*10*60,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MailerModule.forRoot({
      transport: {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "8039b7a03b5ff1",
          pass: "584bf98f13b6ea"
        }
      },
      defaults: {
        from: "LMS@gmail.com"
      }
    }),

    AuthModule,
    CourseModule,
    InstructorModule,
    AdminModule,
    StudentModule,
    EnrollmentModule,
    ContactModule,
    JwtModule,
    AiModule,
    QuizModule,
    BlogModule
  ],

})
export class AppModule {}
