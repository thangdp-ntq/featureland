import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MetaDataFieldsDocument = MetaDataFields & Document;

@Schema({
  timestamps: true,
  collection: 'MetaDataFields',
})
export class MetaDataFields {
  @Prop({ type: Array })
  metaDataFields: MetaDataFieldMultipleLanguage[];
}

export class MetaDataFieldMultipleLanguage {
  @Prop({ type: String })
  en: string;

  @Prop({ type: String })
  cn: string;

  @Prop({ type: String })
  jp: string;
}
export const MetaDataFieldSchema = SchemaFactory.createForClass(MetaDataFields);
