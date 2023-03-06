import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as paginate from "mongoose-paginate-v2";

export type NFTLogDocument = NFTLog & Document;

@Schema({
  timestamps: true,
  collection: "NftLog",
})
export class NFTLog {
  @Prop({ type: String })
  data: string;

  @Prop()
  tokenId: number;

  @Prop({ default: "" })
  from: string;

  @Prop({ default: "" })
  to: string;

  @Prop({ default: "" })
  contractAddress: string;

  @Prop({ default: "" })
  transactionHash: string;

  @Prop({ default: "" })
  chainId: string;

  @Prop({ default: "" })
  recordId: string;

  @Prop({ default: "" })
  eventName: string;

}

export const NFTLogSchema = SchemaFactory.createForClass(NFTLog);
NFTLogSchema.plugin(paginate);
