import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type NonceDocument = Nonce & Document;
export const NONCE = 'nonce';
@Schema({
  timestamps: true,
  collection: 'Nonce',
})
export class Nonce {
  @Prop({ default: NONCE })
  id: string;

  @Prop()
  purchaseNonce: number;

  @Prop()
  claimNonce: number;
}

export const NonceSchema = SchemaFactory.createForClass(Nonce);
