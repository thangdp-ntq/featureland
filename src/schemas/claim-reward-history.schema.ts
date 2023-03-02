import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { CLAIM_STATUS, TRANSACTION_PAID_GAS_STATUS } from '../common/constants';

export type ClaimRewardHistoryDocument = ClaimRewardHistory & Document;

@Schema({
  timestamps: true,
  collection: 'ClaimRewardHistory',
})
export class ClaimRewardHistory {
  @Prop({ type: String })
  userWalletAddress: string;

  @Prop({ type: Number })
  poolId: number;

  @Prop({ type: String })
  poolName: string;

  @Prop({ type: String })
  amount: string;

  @Prop({ type: String })
  rewardCash?: string;

  @Prop({ type: String })
  signature: string;

  @Prop({ type: String })
  allocation: string;

  @Prop({
    type: Number,
    enum: [
      CLAIM_STATUS.CLAIM_PROCESSING,
      CLAIM_STATUS.CLAIM_SUCCESS,
      CLAIM_STATUS.CLAIM_FAIL,
    ],
  })
  status: number;

  @Prop({ type: Number })
  rewardPoolId: number;

  @Prop({ type: String, required: false })
  txId?: string;

  @Prop({
    type: String,
    enum: [
      TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
      TRANSACTION_PAID_GAS_STATUS.PAID_PROCESSING,
      TRANSACTION_PAID_GAS_STATUS.PAID_SUCCESS,
    ],
    required: false,
  })
  gasFeeStatus?: string;

  @Prop({ type: Boolean, default: false })
  bePaidGasFee?: boolean;
}

export const ClaimRewardHistorySchema =
  SchemaFactory.createForClass(ClaimRewardHistory);
ClaimRewardHistorySchema.plugin(paginate);
ClaimRewardHistorySchema.index({ status: 1 });
