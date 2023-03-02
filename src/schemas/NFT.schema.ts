import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';
import { NFT_Status } from '../common/constants';

export type NFTDocument = NFT & Document;

@Schema({
  timestamps: true,
  collection: 'Nfts',
})
export class NFT {
  @Prop({ default: '' })
  @ApiProperty({ example: 'test NFT' })
  NFTname: string;

  @ApiProperty({ example: 'test NFT' })
  @Prop({ default: '' })
  FNFTname: string;

  @ApiProperty({ example: 'test NFT' })
  @Prop({ default: '' })
  symbol: string;

  @ApiProperty({ example: '99999999999999' })
  @Prop()
  numberFNFT: string;

  @ApiProperty({
    example: {
      cn: 'jp',
      en: 'jp',
      jp: 'jp',
    },
  })
  @Prop({ type: 'object', default: {} })
  description: object;

  @ApiProperty({ example: 'test NFT' })
  @Prop()
  transactionId: string;

  @ApiProperty({ example: 'test NFT' })
  @Prop({ default: '' })
  imageURL: string;

  @ApiProperty({ example: 'test NFT' })
  @Prop()
  imageName: string;

  @ApiProperty({ example: 'test NFT' })
  @Prop()
  ipfsCid: string;

  @ApiProperty({ example: false, type: 'boolean' })
  @Prop({ default: false })
  deleted: boolean;

  @ApiProperty({
    example: NFT_Status.NFT_MINT_PROCESSING,
    type: 'string',
    enum: [
      NFT_Status.NFT_FRACTIONALIZED,
      NFT_Status.NFT_UN_FRACTIONALIZED,
      NFT_Status.NFT_MINT_PROCESSING,
    ],
  })
  @Prop({
    default: NFT_Status.NFT_MINT_PROCESSING,
    enum: [
      NFT_Status.NFT_FRACTIONALIZED,
      NFT_Status.NFT_UN_FRACTIONALIZED,
      NFT_Status.NFT_MINT_PROCESSING,
    ],
  })
  status: string;

  @ApiProperty({
    example: NFT_Status.NFT_MINT_PROCESSING,
    type: 'string',
    enum: [
      NFT_Status.NFT_MINT_DONE,
      NFT_Status.NFT_MINT_FAIL,
      NFT_Status.NFT_MINT_PROCESSING,
    ],
  })
  @Prop({
    default: NFT_Status.NFT_MINT_PROCESSING,
    enum: [
      NFT_Status.NFT_MINT_DONE,
      NFT_Status.NFT_MINT_FAIL,
      NFT_Status.NFT_MINT_PROCESSING,
    ],
  })
  mintStatus: string;

  @ApiProperty({
    type: 'string',
    example: 1,
  })
  @Prop({ unique: true })
  tokenId: number;

  @ApiProperty({
    type: 'string',
    example: '0xe4Fd432b16c9b1c1E86d0A359fdC270c5E89258d',
  })
  @Prop()
  contractAddress: string;

  @Prop()
  metadataUrl: string;

  @Prop({ default: 1 })
  step: number;

  @Prop({ type: String, default: '0' })
  availableAmount?: string;

  @Prop({ default: null })
  nftAttribute1: string;

  @Prop({ default: null })
  nftAttribute2: string;

  @Prop({ default: null })
  nftAttribute3: string;

  @Prop({ default: null })
  nftAttribute4: string;

  @Prop()
  attributes: [];

  @ApiProperty({
    example: '0xe3d7fA620EA7Bc5ba8b3AC68AA3ed2eF0768dBcF',
  })
  @Prop({ default: '' })
  nftIdHash: string;

  @ApiProperty({
    example: '0xe3d7fA620EA7Bc5ba8b3AC68AA3ed2eF0768dBcF',
  })
  @Prop({ default: '' })
  fNFTIdHash: string;

  @ApiProperty({
    example:
      '0xc0ebc1eda923feb20ef8eb83ec37a8f530f5a73e59c076f7acd26d0f73bc18e7',
  })
  @Prop({ default: '' })
  nftTransactionHash: string;

  @ApiProperty({
    example:
      '0xc0ebc1eda923feb20ef8eb83ec37a8f530f5a73e59c076f7acd26d0f73bc18e7',
  })
  @Prop({ default: '' })
  fNFTTransactionHash: string;

  @Prop({ type: Array })
  metaDataFields?: MetaDataFieldMultipleLanguage[];

  @Prop({ default: false })
  hasFNFTPool?: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: String })
  fractionalizeBy?: string;

  @Prop({ type: Date })
  fractionalizeOn?: Date;

  @Prop({ type: String })
  deletedBy?: string;

  @Prop({ type: Date })
  deletedOn?: Date;
}
export class MetaDataFieldMultipleLanguage {
  @Prop({ type: String })
  en: string;

  @Prop({ type: String })
  cn: string;

  @Prop({ type: String })
  jp: string;

  @Prop({ type: String })
  value: string;
}
export const NFTSchema = SchemaFactory.createForClass(NFT);
NFTSchema.plugin(paginate);
