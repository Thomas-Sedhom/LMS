import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";

@Schema()
export class User {
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
    // required: true,
    trim: true
  })
  phone: string;
  @Prop({
    type: String,
    required: true,
    enum: RoleEnum,
    trim: true,
    default: RoleEnum.user
  })
  role: RoleEnum;
  @Prop({
    required: true,
    default: () => new Date().toISOString()
  })
  registrationDate: string
}
export const UserSchema =SchemaFactory.createForClass(User)