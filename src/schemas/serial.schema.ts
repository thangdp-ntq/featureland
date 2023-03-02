import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from './language.schema';

export type SerialDocument = Serial & Document;

export enum SerialStatus {
  ON = 'on',
  OFF = 'off',
}

@Schema({
  timestamps: true,
  collection: 'Series',
})
export class Serial {
  @ApiProperty({
    type: Language,
    example: { en: 'Serial name', cn: '', jp: '' },
  })
  @Prop({ required: true, type: Language })
  name: Language;

  @ApiProperty({
    type: String,
    example: SerialStatus.ON,
    enum: SerialStatus,
  })
  @Prop({ default: SerialStatus.ON })
  status: SerialStatus;

  @ApiProperty({
    type: Language,
    example: { en: 'Serial description', cn: '', jp: '' },
  })
  @Prop({ default: null, type: Language, required: false })
  description: Language;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  deletedBy?: string;

  @Prop({ type: Date })
  deletedOn?: Date;
}

export const SerialSchema = SchemaFactory.createForClass(Serial);
SerialSchema.plugin(paginate);
SerialSchema.index({ name: 'text', status: 1 });
