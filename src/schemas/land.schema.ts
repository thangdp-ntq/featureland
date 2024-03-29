import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  collection: "Land",
  versionKey: false,
})
export class Land {
  @Prop({ type: String, index: 1 })
  regionId: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: Number })
  numberNfts: number;

  @Prop({ type: Number, index: 1 })
  version: number;

  @Prop({ type: String, index: 1 })
  ownerAddress: string;

  @Prop({ type: String })
  useAddNftAddress: string;

  @Prop({ type: String })
  description: string;
}

export type LandDocument = Land & Document;
export const LandSchema = SchemaFactory.createForClass(Land);
