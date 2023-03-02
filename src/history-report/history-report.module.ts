import { Module } from '@nestjs/common';
import { HistoryReportService } from './history-report.service';
import { HistoryReportController } from './history-report.controller';
import { UploadService } from '../upload/upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HistoryReport,
  HistoryReportSchema,
  User,
  UserSchema,
} from '~/schemas';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoryReport.name, schema: HistoryReportSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CommonModule,
  ],
  controllers: [HistoryReportController],
  providers: [HistoryReportService, UploadService, EventsGateway],
})
export class HistoryReportModule {}
