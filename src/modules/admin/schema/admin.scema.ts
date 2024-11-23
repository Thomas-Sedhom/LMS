import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import mongoose from 'mongoose';

@Schema()
export class Admin {
  @Prop({
    type: String,
    required: true,
    trim: true
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  })
  email: string;

  @Prop({
    type: String,
    // required: true,
    trim: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  phone: string;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: "Course",
    index: true,
    trim: true,
  })
  coursesId: mongoose.Types.ObjectId[];

  @Prop({
    type: String,
    required: true,
    enum: RoleEnum,
    trim: true,
    default: RoleEnum.admin
  })
  role: RoleEnum;

  @Prop({
    required: true,
    default: () => new Date()
  })
  registrationDate: Date
}
export const AdminSchema = SchemaFactory.createForClass(Admin)