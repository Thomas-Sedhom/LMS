import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schema/admin.scema';
import { EmailService } from '../../shared/services/email.service';
import { TwilioService } from '../../shared/services/twilio.service';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Admin.name, schema: AdminSchema},
    ]),
    JwtModule,
    AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService, EmailService, TwilioService, EmailService],
  exports:[AdminService]
})
export class AdminModule {}
