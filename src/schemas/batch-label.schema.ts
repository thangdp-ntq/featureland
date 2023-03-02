import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as paginate from "mongoose-paginate-v2";
import { Language } from "./language.schema";

export type BatchLabelDocument = BatchLabel & Document;

@Schema({
  timestamps: true,
  collection: 'LabelNFT',
})
export class BatchLabel {
  @ApiProperty({ example: 'seedDiameter' })
  @Prop()
  label: Language;

  @ApiProperty({ example: 'string' })
  @Prop()
  type: string;

  @ApiProperty({ example: 1 })
  @Prop({unique:true})
  index: number;
}

export const BatchLabelSchema = SchemaFactory.createForClass(BatchLabel);
BatchLabelSchema.plugin(paginate);
