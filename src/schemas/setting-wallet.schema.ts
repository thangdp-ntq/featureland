import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SettingWalletDocument = SettingWallet & Document;
@Schema({
  timestamps: true,
  collection: 'SettingWallet',
})
export class SettingWallet {
  @Prop()
  limitPurchase: number;

  @Prop()
  limitClaim: number;

  @Prop({ required: false })
  receiver?: Array<string>;

  @Prop({ default: true })
  isActive: boolean;
}
export const SettingWalletSchema = SchemaFactory.createForClass(SettingWallet);
