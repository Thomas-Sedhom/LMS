import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { TwilioService } from '../../shared/services/twilio.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { FacebookAuthGuard } from '../../common/guards/facebook-auth.guard';
import { EmailService } from '../../shared/services/email.service';
import { Instructor, InstructorSchema } from '../instructor/schema/instructor.schema';
import { Admin, AdminSchema } from '../admin/schema/admin.scema';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TwilioService, EmailService, GoogleStrategy, GoogleAuthGuard, FacebookStrategy, FacebookAuthGuard],
  imports:[
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      {name: Instructor.name, schema: InstructorSchema},
      {name: Admin.name, schema: AdminSchema}
    ]),
    JwtModule
  ],
  exports:[AuthService]
})
export class AuthModule {}
