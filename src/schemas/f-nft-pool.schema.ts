import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { F_NFT_POOL_STATUS, TYPE_POOL } from '../common/constants';
import { Language } from './language.schema';
import { BigNumber } from 'bignumber.js';
import { ApiProperty } from '@nestjs/swagger';

export enum Stages {
  COMING_SOON = 'COMING_SOON',
  OPENED_FOR_REGISTRATION = 'OPENED_FOR_REGISTRATION',
  ON_SALE_SOON = 'ON_SALE_SOON',
  ON_SALE = 'ON_SALE',
  PRODUCTION = 'PRODUCTION',
  OPENED_FOR_REWARD = 'OPENED_FOR_REWARD',
}

export type FNFTPoolDocument = FNFTPool & Document;

export class NFTAttributeSchema {
  @Prop({ type: String })
  label: string;

  @Prop({ type: String })
  value: string;
}
export class MetaDataField {
  en: string;

  cn: string;

  jp: string;
}
export class AllocationSettings {
  @Prop({ type: Number })
  tierNumber: number;

  @Prop({ type: Number })
  allocationPercent: number;
}

export class FNFT {
  @Prop({ type: Number })
  nftId: number;

  @Prop({ type: String })
  nftName: string;

  @Prop({ type: 'object', default: {} })
  description: object;

  @Prop({ type: [NFTAttributeSchema] })
  nftAttributes: NFTAttributeSchema[];

  @Prop({ type: String })
  FNFTname: string;

  @Prop({ type: String })
  fNFTSymbol: string;

  @Prop({ type: String })
  totalSold: string;

  @Prop({ type: String })
  exchangeRates: string;

  @Prop({ type: String })
  totalSupply?: string;

  @Prop({ type: String })
  availableAmount?: string;

  @Prop({ default: '' })
  nftIdHash: string;

  @Prop({ default: '' })
  fNFTIdHash: string;

  @Prop({ default: '' })
  nftTransactionHash: string;

  @Prop({ default: '' })
  fNFTTransactionHash: string;

  @Prop({ type: [MetaDataField] })
  metaDataFields: MetaDataField[];

  @ApiProperty({ example: 'test F-NFT' })
  @Prop()
  fNFTUrl: string;
}

@Schema({
  timestamps: true,
  collection: 'FNFTPool',
  versionKey: false,
})
export class FNFTPool {
  @Prop({ type: Object })
  poolName: Language;

  @Prop({ type: String })
  poolImage?: string;

  @Prop({ type: String })
  poolVideo?: string;

  @Prop({ type: Object })
  poolDescription: Language;

  @Prop({ type: Number, enum: [F_NFT_POOL_STATUS.OFF, F_NFT_POOL_STATUS.ON] })
  status: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Series' })
  seriesId?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Path' })
  pathId?: string;

  @Prop({ type: String })
  blockchainNetwork?: string;

  @Prop({ type: String, default: '0' })
  withdraw?: string;

  @Prop({ type: String })
  acceptedCurrencyAddress?: string;

  @Prop({ type: String })
  acceptedCurrencySymbol?: string;

  @Prop({ type: String })
  acceptedCurrencyDecimals?: string;

  @Prop({ type: String })
  receiveWalletAddress?: string;

  @Prop({ type: Date })
  registrationStartTime?: Date;

  @Prop({ type: Date })
  registrationEndTime?: Date;

  @Prop({ type: Date })
  purchaseStartTime?: Date;

  @Prop({ type: Date })
  purchaseEndTime?: Date;

  @Prop({ type: Date })
  productionPeriodStartTime?: Date;

  @Prop({ type: Date })
  productionPeriodEndTime?: Date;

  @Prop({ type: FNFT })
  fNFT?: FNFT;

  @Prop({ type: Array })
  users?: any[];

  @Prop({ type: Number })
  step?: number;

  @Prop({ type: Array })
  allocationSettings?: AllocationSettings[];

  @Prop({ type: Array })
  configWhitelist?: [];

  @Prop({
    type: Number,
    enum: [TYPE_POOL.DRAFT, TYPE_POOL.ONCHAIN],
    default: TYPE_POOL.DRAFT,
  })
  poolType?: number;

  @Prop({ type: String })
  whitelistURL: string;

  @Prop({ type: Date })
  whitelistAnnouncementTime?: Date;

  @Prop({ unique: true })
  poolId?: number;

  @Prop({ unique: false })
  rewardId?: number;

  @Prop({ default: false })
  isFCFS?: boolean;

  @Prop({ type: String })
  allocationFCFS?: string;

  @Prop({ type: String })
  availableAmount?: string; // so luong FNFT ban con lai trong pool

  @Prop({ type: Array })
  timelines?: TimelineMultipleLanguage[];

  // array end date of each step timeline, name field change later
  @Prop({ type: Array })
  startTimelines?: Date[];

  @Prop({ type: Boolean, default: false })
  isRefund?: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Date })
  mintedOn?: Date;

  @Prop({ type: String })
  mintedBy?: string;

  @Prop({ default: false })
  bePaidGasFee?: boolean; // if true then pool will has system wallet pay gas fee.

  @Prop({ type: Number, required: false })
  limitPurchase?: number;
}

export class TimelineMultipleLanguage {
  @Prop({ type: String })
  en: string;

  @Prop({ type: String })
  cn: string;

  @Prop({ type: String })
  jp: string;
}

export const FNFTPoolSchema = SchemaFactory.createForClass(FNFTPool);
FNFTPoolSchema.plugin(paginate);

FNFTPoolSchema.virtual('openDate').get(function () {
  return this.purchaseStartTime ? this.purchaseStartTime : 'TBA';
});

FNFTPoolSchema.virtual('smartContractBalance').get(function () {
  // so smart contract dang nam giu
  return (
    new BigNumber(this.fNFT.totalSupply)
      .minus(new BigNumber(this.fNFT.totalSold))
      .plus(new BigNumber(this.fNFT.availableAmount))
      .minus(new BigNumber(this.withdraw)) || 0
  );
});

FNFTPoolSchema.virtual('circulating').get(function () {
  // so no da ban dc
  return (
    new BigNumber(this.fNFT.totalSold)
      .minus(this.fNFT.availableAmount)
      .toString() || 0
  );
});

FNFTPoolSchema.virtual('target').get(function () {
  const value = new BigNumber(this.fNFT?.exchangeRates).multipliedBy(
    new BigNumber(this.fNFT.totalSold),
  );
  return value || '';
});
FNFTPoolSchema.virtual('price').get(function () {
  const value = +this.fNFT?.exchangeRates || 0;
  return value || '';
});

FNFTPoolSchema.virtual('stage').get(function () {
  if (
    new Date() >= new Date(this.registrationStartTime) &&
    new Date() < new Date(this.registrationEndTime)
  ) {
    return Stages.OPENED_FOR_REGISTRATION;
  }

  if (
    new Date() >= new Date(this.purchaseStartTime) &&
    new Date() < new Date(this.purchaseEndTime)
  ) {
    return Stages.ON_SALE;
  }

  if (new Date(this.registrationStartTime) > new Date()) {
    return Stages.COMING_SOON;
  }

  if (
    new Date() >= new Date(this.registrationEndTime) &&
    new Date() < new Date(this.purchaseStartTime)
  ) {
    return Stages.ON_SALE_SOON;
  }

  if (new Date() > new Date(this.purchaseEndTime)) {
    return Stages.PRODUCTION;
  }
});

FNFTPoolSchema.set('toJSON', { virtuals: true });

export class PoolUsers {
  address: string;

  name: string;

  tier: number;

  eachUserUSDT: string;

  allocationEachUser: string;

  remaining: string;

  claim: string;

  // so fnft ma user da mua trong pool
  fnftBalance: string;
}
