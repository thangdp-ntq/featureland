import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import {
  User,
  UserSchema,
  TieringStructure,
  TieringStructureSchema,
} from '~/schemas';

import { TieringStructureController } from './tiering-structure.admin.controller';
import { TieringStructureService } from './tiering-structure.service';
import { TieringPool, TieringPoolSchema } from '../schemas/pool-tiering.schema';
import { TieringStructureUser } from './tiering-structure.user.controller';
import { CommonService } from '~/common-service/common.service';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { CommonModule } from '~/common-service/common.module';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { EventsGateway } from '~/socket/socket.gateway';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TieringStructure.name, schema: TieringStructureSchema },
      { name: User.name, schema: UserSchema },
      { name: TieringPool.name, schema: TieringPoolSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
    ]),
    WinstonModule,
    CommonModule,
  ],
  controllers: [TieringStructureController, TieringStructureUser],
  providers: [TieringStructureService, CommonService, EventsGateway],
})
export class TieringStructureModule {}
