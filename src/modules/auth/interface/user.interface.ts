import { RoleEnum } from '../../../common/enum/role.enum';
import mongoose from 'mongoose';
export interface UserInterface {
  _id?: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: RoleEnum;
  registrationDate?: Date;
}