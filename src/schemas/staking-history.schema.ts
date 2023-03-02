import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';
import { STAKING_TYPE } from '../common/constants';

export type HistoryStakingDocument = HistoryStaking & Document;
@Schema({
  timestamps: true,
  collection: 'HistoryStaking',
  versionKey: false,
})
export class HistoryStaking {
  @ApiProperty({ example: '0x...' })
  @Prop({ type: String })
  userAddress: string;

  @ApiProperty({ example: 1 })
  @Prop({ type: 'string' })
  value: string;

  @ApiProperty({ example: 1 })
  @Prop({
    enum: STAKING_TYPE,
  })
  type: number;

  @ApiProperty({ example: '1000000' })
  @Prop({ type:'string' })
  balance: string;

  @ApiProperty({ example: 1 })
  @Prop({ type: Number })
  minBalance: number;
}
export const HistoryStakingSchema =
  SchemaFactory.createForClass(HistoryStaking);
HistoryStakingSchema.plugin(paginate);
HistoryStakingSchema.index({ userAddress: 'text', status: 1 });
