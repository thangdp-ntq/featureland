import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  ADMIN = 1,
  USER = 2,
  SUPPER_ADMIN = 3,
}

@Schema({
  timestamps: true,
  collection: 'User',
})
export class User {
  @ApiProperty({ type: String, example: 'addres-abc-xyz' })
  @Prop()
  address: string;

  @ApiProperty({ type: String, example: UserRole.USER, enum: UserRole })
  @Prop({ default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ type: String, example: UserStatus.ACTIVE, enum: UserStatus })
  @Prop({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ type: String, example: 'username' })
  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  authToken?: string;

  @ApiProperty({ type: String, example: 'Description' })
  @Prop({ type: String, required: false, default: '' })
  description?: string;

  @Prop({ type: Date })
  joinDate: Date;

  @Prop({ type: String, default: '0' })
  balance: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.virtual('name')
//   .get(function () {
//     return this.username || null;
//   })
//   .set(function () {
//     this.set(this.username);
//   });
UserSchema.index({ address: 1 }, { unique: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.plugin(paginate);
