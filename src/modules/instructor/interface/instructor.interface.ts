import { Prop } from '@nestjs/mongoose';
import { RoleEnum } from '../../../common/enum/role.enum';
import mongoose from 'mongoose';

export interface InstructorInterface {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  subject: string;
  coursesId?: mongoose.Types.ObjectId[];
  description: string;
  role: RoleEnum;
  registrationDate: Date
}