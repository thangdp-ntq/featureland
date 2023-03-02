import { Module } from '@nestjs/common';
import { TimeSettingController } from './time-setting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { TimeSettingService } from './time-setting.service';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeSetting.name, schema: TimeSettingSchema },
    ]),
    CommonModule,
  ],
  controllers: [TimeSettingController],
  providers: [TimeSettingService, EventsGateway],
})
export class TimeSettingModule {}
