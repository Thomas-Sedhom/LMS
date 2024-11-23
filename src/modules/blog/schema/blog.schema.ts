import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    required: true,
    type: String,
  })
  title: string;

  @Prop({
    required: true,
    type: String,
  })
  details: string;

  @Prop({
    required: true,
    type: String,
  })
  image: string;
}

// Create the schema
export const BlogSchema = SchemaFactory.createForClass(Blog);