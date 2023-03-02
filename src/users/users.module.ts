import {
  HistoryStaking,
  HistoryStakingSchema,
} from './../schemas/staking-history.schema';
import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersAdminController } from './users.admin.controller';
import {
  FNFTPool,
  FNFTPoolSchema,
  HistoryReport,
  HistoryReportSchema,
  Path,
  PathSchema,
  Serial,
  SerialSchema,
  User,
  UserSchema,
} from '~/schemas';
import { HistoryReportService } from '~/history-report/history-report.service';
import { UploadService } from '~/upload/upload.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { SeriesService } from '~/series/series.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: Path.name, schema: PathSchema },
      { name: HistoryReport.name, schema: HistoryReportSchema },
      { name: Serial.name, schema: SerialSchema },
      { name: HistoryStaking.name, schema: HistoryStakingSchema },
    ]),
  ],
  controllers: [UsersController, UsersAdminController],
  providers: [
    UsersService,
    UploadService,
    HistoryReportService,
    JwtStrategy,
    SeriesService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
