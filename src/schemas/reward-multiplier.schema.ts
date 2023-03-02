import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RewardMultiplierDocument = RewardMultiplier & Document;

@Schema({
  timestamps: true,
  collection: 'RewardMultiplier',
})
export class RewardMultiplier {
  @ApiProperty({
    type: Number,
    example: 0,
  })
  @Prop()
  min: number;

  @ApiProperty({
    type: Number,
    example: 5,
  })
  @Prop()
  max: number;
}
export const RewardMultiplierSchema =
  SchemaFactory.createForClass(RewardMultiplier);
