import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from './schema/instructor.schema';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { EmailService } from '../../shared/services/email.service';
import { TwilioService } from '../../shared/services/twilio.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService, EmailService, TwilioService],
  imports:[
    MongooseModule.forFeature([
      {name: Instructor.name, schema: InstructorSchema},
    ]),
    JwtModule,
    AuthModule
  ],
  exports: [InstructorService]
})
export class InstructorModule {}
