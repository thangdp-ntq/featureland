import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  collection: 'Signer',
  versionKey: false,
})
export class Signer {
  @Prop({ type: String })
  signer: string;

  @Prop({ type: String })
  hashKey: string;

  @Prop({ type: Boolean })
  isActive: boolean

  @Prop({ type: String })
  chain: string;
}

export const SignerSchema = SchemaFactory.createForClass(Signer);