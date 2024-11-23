import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })  // This will automatically add createdAt and updatedAt fields

export class Contact {
  @Prop({
    required: true,
    trim: true,
    type: String
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    type: String
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    type: String
  })
  message: string;

  @Prop({
    required: true,
    trim: true,
    type: mongoose.Types.ObjectId,
    ref: "User",
    index: true,
  })
  studentId: mongoose.Types.ObjectId;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
