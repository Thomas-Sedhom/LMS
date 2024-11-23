import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './schema/enrollment.schema';
import { CourseModule } from '../course/course.module';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { AuthModule } from '../auth/auth.module';
import { Code, CodeSchema } from './schema/code.schema';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  imports: [
    MongooseModule.forFeature([
      {name: Enrollment.name, schema: EnrollmentSchema},
      {name: Code.name, schema: CodeSchema},
    ]),
    CourseModule,
    JwtModule,
    AuthModule
  ],

})
export class EnrollmentModule {}
