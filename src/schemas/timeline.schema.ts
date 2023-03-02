import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type TimelineDocument = Timeline & Document;

@Schema({
  timestamps: true,
  collection: 'Timeline',
})
export class Timeline {
  @ApiProperty({ type: String, example: 'timeline description' })
  @Prop({ required: true, type: String })
  description: string;

  @ApiProperty({ type: Number, example: '1' })
  @Prop({ required: true, type: 'Number', unique: true })
  step: number;
}

export const TimelineSchema = SchemaFactory.createForClass(Timeline);
TimelineSchema.plugin(paginate);
TimelineSchema.index({ step: 1 });
