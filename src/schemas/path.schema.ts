import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PathDocument = Path & Document;

@Schema({
  timestamps: true,
  collection: 'Path',
})
export class Path {
  @Prop({ type: String })
  name: string;
}

export const PathSchema = SchemaFactory.createForClass(Path);