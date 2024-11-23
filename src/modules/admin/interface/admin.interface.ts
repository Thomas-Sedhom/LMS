import { RoleEnum } from '../../../common/enum/role.enum';
import mongoose from 'mongoose';
export interface AdminInterface {
  _id?: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  coursesId?: mongoose.Types.ObjectId[];
  role?: RoleEnum;
  registrationDate?: Date;
}