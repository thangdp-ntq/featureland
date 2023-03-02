import { ObjectId, Schema as MongoSchema, Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { User } from './user.schema';

@Schema({ id: true, collection: 'JwtToken', timestamps: true })
export class JwtToken {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: String })
  hashToken: string;

  @Prop({ type: MongoSchema.Types.Buffer })
  token: string;

  @Prop({ type: MongoSchema.Types.Date })
  expiredAt: Date;
}

export const JwtTokenSchema = SchemaFactory.createForClass(JwtToken);
JwtTokenSchema.index({ hashToken: 1 });
JwtTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
export type JwtTokenDocument = JwtToken & Document;
