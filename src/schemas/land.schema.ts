import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  collection: "Land",
  versionKey: false,
})
export class Land {
  @Prop({ type: String })
  regionId: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: Number })
  numberNfts: number;

  @Prop({ type: Number })
  version: number;

  @Prop({ type: Number })
  ownerId: number;
}

export type LandDocument = Land & Document;
export const LandSchema = SchemaFactory.createForClass(Land);