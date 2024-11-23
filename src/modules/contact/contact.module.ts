import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './schema/contact.schema';
import { JwtModule } from '../../shared/modules/jwt/jwt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports: [
    MongooseModule.forFeature([
      {name: Contact.name, schema: ContactSchema},
    ]),
    JwtModule,
    AuthModule
  ],
})
export class ContactModule {}
