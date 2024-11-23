import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import mongoose from "mongoose";

@Schema({timestamps: true})
export class Code {
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true
  })
  code: string;
}
export const CodeSchema = SchemaFactory.createForClass(Code);