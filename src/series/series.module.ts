import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SeriesAdminController } from './series.admin.controller';
import {
  FNFTPool,
  FNFTPoolSchema,
  Serial,
  SerialSchema,
  User,
  UserSchema,
} from '~/schemas';
import { SeriesUserController } from './series.user.controller';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Serial.name, schema: SerialSchema },
      { name: User.name, schema: UserSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
    ]),
    CommonModule,
  ],
  controllers: [SeriesAdminController, SeriesUserController],
  providers: [SeriesService, EventsGateway],
})
export class SeriesModule {}
