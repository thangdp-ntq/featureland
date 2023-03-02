import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from './language.schema';

export type TieringStructureDocument = TieringStructure & Document;

@Schema({
  timestamps: true,
  collection: 'TieringStructure',
})
export class TieringStructure {
  @ApiProperty({ type: Number, example: 1 })
  @Prop({ type: Number })
  tierNumber: number;

  @ApiProperty({ type: Language })
  @Prop({ type: Object })
  name: Language;

  @ApiProperty({ type: Number, example: 30 })
  @Prop({ type: Number })
  stakingPeriod: number;

  @ApiProperty({ type: Number, example: 100000 })
  @Prop({ type: Number })
  stakingQuantity: number;

}

export const TieringStructureSchema =
  SchemaFactory.createForClass(TieringStructure);
