import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as paginate from 'mongoose-paginate-v2';

export type UserStakingDocument = UserStaking & Document;

@Schema({
  timestamps: true,
  collection: 'UserStaking',
})
export class UserStaking {
  @ApiProperty({ type: Number, example: '1' })
  @Prop({ required: true, type: 'Number', unique: true })
  userWallet: number;

  @ApiProperty({ type: Number, example: '1' })
  @Prop({ required: true, type: 'Number' })
  balance: number;
}

export const UserStakingSchema = SchemaFactory.createForClass(UserStaking);
UserStakingSchema.plugin(paginate);
