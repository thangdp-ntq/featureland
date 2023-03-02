import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimeSettingDocument = TimeSetting & Document;

@Schema({
  timestamps: true,
  collection: 'TimeSetting',
})
export class TimeSetting {
  // day = 2 -> Monday, 3 -> Thursday,..., 8 -> Sunday. Example: [0,1,2,3]
  @Prop({ required: true, type: Array })
  days: number[];

  // HH:MM:SS
  @Prop({ required: true, type: String })
  hourFrom: string;

  @Prop({ required: true, type: String })
  hourTo: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Array, default: [] })
  admins?: string[];
}

export const TimeSettingSchema = SchemaFactory.createForClass(TimeSetting);
