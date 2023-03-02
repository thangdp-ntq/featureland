import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { BLOCKCHAIN_NETWORK, TOKEN_STATUS } from '~/common/constants';
export type PriceTokenDocument = PriceToken & Document;
@Schema({
  timestamps: true,
  collection: 'PriceToken',
})
export class PriceToken {
  @Prop({ default: BLOCKCHAIN_NETWORK.BSC })
  blockchainNetwork: string;

  @Prop()
  contractAddress: string;

  @Prop()
  contractSymbol: string;

  @Prop()
  contractDecimals: string;

  @Prop({
    default: TOKEN_STATUS.TOKEN_ON,
    enum: [TOKEN_STATUS.TOKEN_ON, TOKEN_STATUS.TOKEN_OFF],
  })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isInput: boolean;

  @Prop({ required: false })
  usdPriceInput: string;

  @Prop({ required: false })
  usdPrice30Days: string;
}

export const PriceTokenSchema = SchemaFactory.createForClass(PriceToken);
PriceTokenSchema.plugin(paginate);
PriceTokenSchema.index({ contractAddress: 'text' });
