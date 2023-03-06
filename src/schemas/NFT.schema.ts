import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as paginate from "mongoose-paginate-v2";
import { NFT_Status } from "../common/constants";

export type NFTDocument = NFT & Document;

@Schema({
  timestamps: true,
  collection: "Nfts",
})
export class NFT {
  @Prop({ default: "" })
  @ApiProperty({ example: "test NFT" })
  NFTname: string;

  @ApiProperty({ example: "test NFT" })
  @Prop({ default: "" })
  symbol: string;

  @ApiProperty({})
  @Prop({ type: "object", default: "" })
  description: string;

  @ApiProperty({ example: "test NFT" })
  @Prop()
  transactionId: string;

  @ApiProperty({ example: "test NFT" })
  @Prop({ default: "" })
  image: string;

  @ApiProperty({
    type: "string",
    example: 1,
  })
  @Prop({ unique: true })
  tokenId: number;

  @ApiProperty({
    type: "string",
    example: "0xe4Fd432b16c9b1c1E86d0A359fdC270c5E89258d",
  })
  @Prop()
  contractAddress: string;

  @ApiProperty({
    type: "string",
    example: "0xe4Fd432b16c9b1c1E86d0A359fdC270c5E89258d",
  })
  @Prop({default:''})
  landId: string;


  @ApiProperty({
    type: "string",
    example: "0xe4Fd432b16c9b1c1E86d0A359fdC270c5E89258d",
  })
  @Prop({default:''})
  ownerAddress: string;

}
export const NFTSchema = SchemaFactory.createForClass(NFT);
NFTSchema.plugin(paginate);
