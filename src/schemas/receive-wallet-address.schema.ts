import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ReceiveWalletAddressDocument = ReceiveWalletAddress & Document;

@Schema({
  timestamps: true,
  collection: 'ReceiveWalletAddress',
})
export class ReceiveWalletAddress {
  @ApiProperty({
    type: String,
    example: '0xC95fE6812cCF43e6Ae3817189e1B406ea8b78A7C',
  })
  @Prop()
  address: string;
}
export const ReceiveWalletAddressSchema =
  SchemaFactory.createForClass(ReceiveWalletAddress);
