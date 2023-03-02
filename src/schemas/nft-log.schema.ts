import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type NFTLogDocument = NFTLog & Document;

@Schema({
  timestamps: true,
  collection: 'NftLog',
})
export class NFTLog {
  @Prop({ type: String })
  data: string;

  @Prop()
  tokenId: number;

  @Prop({ default: '' })
  NFTname: string;

  @Prop({ default: '' })
  FNFTname: string;

  @Prop()
  contractAddress: string;

  @Prop({ type: String })
  removedBy?: string;

  @Prop({ type: Date })
  removedOn?: Date;
}

export const NFTLogSchema = SchemaFactory.createForClass(NFTLog);
NFTLogSchema.plugin(paginate);
