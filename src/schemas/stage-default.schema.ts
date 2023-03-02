import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StageDefaultDocument = StageDefault & Document;

@Schema({
  timestamps: true,
  collection: 'StageDefault',
  versionKey: false,
})
export class StageDefault {
  @Prop({ type: Array })
  timelines: TimelineMultipleLanguage[];
}

export class TimelineMultipleLanguage {
  @Prop({ type: String })
  en: string;

  @Prop({ type: String })
  cn: string;

  @Prop({ type: String })
  jp: string;
}

export const StageDefaultSchema = SchemaFactory.createForClass(StageDefault);
