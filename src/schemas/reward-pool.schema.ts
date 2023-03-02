import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';
import { RewardPoolMintStatus, RewardPoolStatus } from '~/common/constants';
import { FNFTPool } from './f-nft-pool.schema';
import { Schema as MongoSchema, Document } from 'mongoose';
import BigNumber from 'bignumber.js';
import { Language } from './language.schema';

export type RewardPoolDocument = RewardPool & Document;

@Schema({
  timestamps: true,
  collection: 'RewardPool',
  versionKey: false,
})
export class RewardPool {
  @ApiProperty({ example: 1 })
  @Prop({ type: MongoSchema.Types.ObjectId, ref: FNFTPool.name })
  FNFTPool: FNFTPool;

  @ApiProperty({ example: 1 })
  @Prop({ type: MongoSchema.Types.Number, ref: FNFTPool.name })
  FNFTPoolId: number;

  @ApiProperty({ example: '10000000' })
  @Prop({ type: String })
  totalSupply: string;

  @ApiProperty({ example: '400000' })
  @Prop({ type: String })
  availableAmount: string;

  @ApiProperty({
    type: Language,
    required: true,
    description: 'Name of reward pool',
  })
  @Prop({ type: Language, required: true })
  name: Language;

  @ApiProperty({ example: 1, description: '1 is status on , 0 is status off' })
  @Prop({
    type: Number,
    enum: [RewardPoolStatus.ON, RewardPoolStatus.OFF],
    default: RewardPoolStatus.ON,
  })
  status: number;

  @ApiProperty({
    example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462',
    maxLength: 256,
    description: 'Token contract address',
    required: true,
  })
  @Prop({
    type: String,
    maxlength: 256,
  })
  tokenContractAddress: string;
  @ApiProperty({
    example: 'USDT',
    description: 'Token contract symbol',
    required: true,
  })
  @Prop({
    type: String,
    required: true,
    default: 'USDT',
  })
  currencySymbol: string;

  @Prop({
    type: String,
    required: false,
  })
  currencyDecimals: string;

  @ApiProperty({
    example: '1234.123',
    description: 'Total reward amount',
    required: true,
  })
  @Prop({ type: String })
  total: string;

  @ApiProperty({
    example: '3000',
    description: 'F-NFT Sold Amount in USD',
    required: true,
  })
  @Prop({ type: String })
  soldAmountUSD: string;

  @ApiProperty({
    example: '1',
    description: 'Reward Multiplier',
    required: true,
  })
  @Prop({ type: String })
  rewardMultiplier: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Date string format YYYY-MM-DD HH:mm:ss',
  })
  @Prop({ type: Date })
  poolOpenTime: Date;

  @Prop({ type: String })
  exchangeRates: string;

  @Prop({ type: String })
  contractFNFTPoolUSD: string;

  @Prop({ type: String })
  contractRewardPoolUSD: string;

  // option select price of currency in FNFTPool: Get from Coingeko OR input manually
  @Prop({ default: false })
  isInputFNFTPoolPrice: boolean;

  // option select price of currency in Reward: Get from Coingeko OR input manually
  @Prop({ default: false })
  isInputRewardPrice: boolean;

  @ApiProperty({
    required: false,
    example: RewardPoolMintStatus.PROCESSING,
    enum: RewardPoolMintStatus,
    default: RewardPoolMintStatus.PROCESSING,
    description: '1 is status done , 0 is status in progress',
  })
  @Prop({
    type: Number,
    enum: [RewardPoolMintStatus.PROCESSING, RewardPoolMintStatus.DONE],
    default: RewardPoolMintStatus.PROCESSING,
  })
  mintStatus: number;

  @Prop({ unique: true })
  rewardPoolId?: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  updatedBy?: string;

  // USD users has claimed in reward pool
  @Prop({ type: String, default: '0' })
  claim?: string;

  @Prop({ default: false })
  bePaidGasFee?: boolean; // if true then pool will has system wallet pay gas fee.
}

export const RewardPoolSchema = SchemaFactory.createForClass(RewardPool);

RewardPoolSchema.virtual('totalRewardUSD').get(function () {
  return (
    new BigNumber(this.soldAmountUSD)
      .multipliedBy(new BigNumber(this.rewardMultiplier))
      .toFixed(8, 1)
      .toString() || '0'
  );
});

RewardPoolSchema.virtual('poolContractAddress').get(() => {
  return process.env.CONTRACT_PROXY;
});

RewardPoolSchema.virtual('circulating').get(function () {
  return (
    new BigNumber(this.totalSupply).minus(this.availableAmount).toString() || 0
  );
});

RewardPoolSchema.virtual('smartContractBalance').get(function () {
  return new BigNumber(this.availableAmount).toString() || 0;
});

RewardPoolSchema.virtual('hasUserClaim').get(function () {
  let claim = 0;
  if (this.FNFTPool?.users?.length) {
    this.FNFTPool.users.forEach((user) => {
      claim = claim + (+user.claim ?? 0);
    });
  }
  return claim > 0;
});

RewardPoolSchema.virtual('poolId').get(function () {
  return this._id;
});

RewardPoolSchema.set('toJSON', { virtuals: true });

RewardPoolSchema.plugin(paginate);
RewardPoolSchema.index({ name: 'text', status: 1, nftId: 1 });
