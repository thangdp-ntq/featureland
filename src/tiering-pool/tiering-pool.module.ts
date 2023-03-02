import { CommonModule } from './../common-service/common.module';
import { Module } from '@nestjs/common';
import { TieringPoolService } from './tiering-pool.service';
import { TieringPoolController } from './tiering-pool.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TieringPool, TieringPoolSchema } from '../schemas/pool-tiering.schema';
import { TieringControllerUser } from './tiering-pool.user.controller';
import {
  HistoryStaking,
  HistoryStakingSchema,
  User,
  UserSchema,
} from '../schemas';
import { IdPool, IdPoolSchema } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TieringPool.name, schema: TieringPoolSchema },
      { name: HistoryStaking.name, schema: HistoryStakingSchema },
      { name: User.name, schema: UserSchema },
      { name: IdPool.name, schema: IdPoolSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
    ]),
    CommonModule,
  ],
  controllers: [TieringPoolController, TieringControllerUser],
  providers: [TieringPoolService, CommonService, EventsGateway],
})
export class TieringPoolModule {}
