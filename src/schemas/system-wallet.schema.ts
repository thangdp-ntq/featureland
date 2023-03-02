import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum WALLET_TYPE {
  PURCHASE = 1,
  CLAIM = 2,
}

// Collection Wallet to pays fee gas for purchase & claim
export type SystemWalletDocument = SystemWallet & Document;
@Schema({
  timestamps: true,
  collection: 'SystemWallet',
})
export class SystemWallet {
  @Prop()
  privateKey: string;

  @Prop()
  publicKey: string;

  @Prop({ enum: WALLET_TYPE })
  type: number;

  @Prop({ default: 0 })
  nonce?: number;

  @Prop({ type: Date })
  updatedAt?: Date;
}
export const SystemWalletSchema = SchemaFactory.createForClass(SystemWallet);
SystemWalletSchema.index({ type: 1 });
