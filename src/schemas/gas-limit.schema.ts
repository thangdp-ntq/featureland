import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GasLimitDocument = GasLimit & Document;
@Schema({
  collection: 'GasLimit',
})
export class GasLimit {
  @Prop()
  gasLimit: number;
}
export const GasLimitSchema = SchemaFactory.createForClass(GasLimit);
