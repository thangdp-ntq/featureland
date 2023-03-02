import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';
import { LANGUAGE } from '../common/constants';
import { Language } from './language.schema';

export type HistoryReportDocument = HistoryReport & Document;

@Schema({
  timestamps: true,
  collection: 'HistoryReport',
})
export class HistoryReport {
  @ApiProperty({
    type: String,
    example: 'https://da-fractionalize-api.ekoios.net/1652346314809-sample.pdf',
  })
  @Prop({ type: String })
  historyReportUrl: string;

  @ApiProperty({ type: Language, example: 'string', default: LANGUAGE.EN })
  @Prop({ type: String })
  language: string;

  @ApiProperty()
  @Prop()
  updateBy: string;
}

export const HistoryReportSchema = SchemaFactory.createForClass(HistoryReport);
HistoryReportSchema.plugin(paginate);
