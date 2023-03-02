import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';
import { TieringPoolStatus } from '../common/constants';

export type TieringPoolDocument = TieringPool & Document;

@Schema({
  timestamps: true,
  collection: 'TieringPool',
  versionKey: false,
})
export class TieringPool {
  @ApiProperty({ example: 1 })
  @Prop({ type: Number })
  tieringPoolId?: number;

  @ApiProperty({ example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462' })
  @Prop({ type: String })
  poolContractAddress: string;

  @Prop({
    type: String,
  })
  tieringTokenAddress: string;

  @Prop({
    type: Number,
  })
  lockDuration: number;

  @Prop({ type: Number })
  withdrawDelayDuration: number;

  @ApiProperty({ type: Number, example: TieringPoolStatus.OFF })
  @Prop({
    type: Number,
    enum: TieringPoolStatus,
    default: TieringPoolStatus.ON,
  })
  tieringPoolStatus?: number;

}

export const TieringPoolSchema = SchemaFactory.createForClass(TieringPool);
TieringPoolSchema.plugin(paginate);
TieringPoolSchema.index({ poolName: 'text', status: 1 });
TieringPoolSchema.index({ tieringPoolId: 'text', status: 1 });