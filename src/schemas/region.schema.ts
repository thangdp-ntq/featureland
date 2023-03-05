import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  collection: "Region",
  versionKey: false,
})
export class Region {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: String })
  description: string;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
