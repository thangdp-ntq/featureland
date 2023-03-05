import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NFT,
  NFTSchema,
  User,
  UserSchema,
} from '~/schemas';
import { UploadService } from '../upload/upload.service';
import { WinstonModule } from 'nest-winston';
import { CommonModule } from '~/common-service/common.module';
import { NFTLog, NFTLogSchema } from '~/schemas/nft-log.schema';
import { EventsGateway } from '~/socket/socket.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    WinstonModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forFeature([
      { name: NFT.name, schema: NFTSchema },
      { name: User.name, schema: UserSchema },
      { name: NFTLog.name, schema: NFTLogSchema },
    ]),
    CommonModule,
  ],
  controllers: [NftController],
  providers: [NftService, UploadService, EventsGateway,],
})
export class NftModule {}
