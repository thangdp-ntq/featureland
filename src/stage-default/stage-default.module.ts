import { Module } from '@nestjs/common';
import { StageDefaultService } from './stage-default.service';
import { StageDefaultAdminController } from './stage-default.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StageDefault,
  StageDefaultSchema,
} from '../schemas/stage-default.schema';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StageDefault.name, schema: StageDefaultSchema },
    ]),
    CommonModule,
  ],
  controllers: [StageDefaultAdminController],
  providers: [StageDefaultService, EventsGateway],
})
export class StageDefaultModule {}
