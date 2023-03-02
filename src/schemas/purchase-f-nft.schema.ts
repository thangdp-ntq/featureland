import { TRANSACTION_PAID_GAS_STATUS } from './../common/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { PURCHASE_STATUS } from '../common/constants';

export type PurchaseFNFTDocument = PurchaseFNFT & Document;

@Schema({
  timestamps: true,
  collection: 'PurchaseFNFT',
  versionKey: false,
})
export class PurchaseFNFT {
  @Prop({ type: String })
  userWalletAddress: string;

  @Prop({ type: Number })
  poolId: number;

  @Prop({ type: String })
  poolName: string;

  @Prop({ type: String })
  amount: string;

  @Prop({ type: String })
  purchaseFNFT?: string;

  @Prop({ type: String })
  decimals: string;

  @Prop({ type: Number })
  nonce: number;

  @Prop({ type: Number, required: false })
  nonceTransaction?: number; // nonce in case purchased by system wallet

  @Prop({ type: Boolean, default: false })
  bePaidGasFee?: boolean;

  @Prop({ type: String })
  signature: string;

  @Prop({ type: String })
  allocation: string;

  @Prop({ type: String })
  allocationUSDT?: string;

  @Prop({
    type: Number,
    enum: [
      PURCHASE_STATUS.PURCHASE_PROCESSING,
      PURCHASE_STATUS.PURCHASE_SUCCESS,
      PURCHASE_STATUS.PURCHASE_FAIL,
    ],
  })
  status: number;

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
}

export const PurchaseFNFTSchema = SchemaFactory.createForClass(PurchaseFNFT);
PurchaseFNFTSchema.plugin(paginate);
PurchaseFNFTSchema.index({ status: 1 });
