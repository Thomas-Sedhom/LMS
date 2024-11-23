import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { EmailService } from '../../shared/services/email.service';
import { TwilioService } from '../../shared/services/twilio.service';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schema/user.schema';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService, EmailService, TwilioService],
  imports:[
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
    ]),
    JwtModule,
    AuthModule
  ],
  exports: [StudentService]
})
export class StudentModule {}
