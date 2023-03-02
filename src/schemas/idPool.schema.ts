import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
export type IdPoolDocument = IdPool & Document;

@Schema({
  timestamps: true,
  collection: 'IdPool',
})
export class IdPool {
  @ApiProperty()
  @Prop()
  id: number;
}

export const IdPoolSchema = SchemaFactory.createForClass(IdPool);
