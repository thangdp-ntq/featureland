import { CacheModule, CacheModuleOptions, Module, Scope } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { AuthModule } from './auth/auth.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './providers/kafka/kafka.module';
import { NftModule } from './nft/nft.module';
import { WebhookModule } from './webhook/webhook.module';
import { TieringStructureModule } from './tiering-structure/tiering-structure.module';
import { Connection } from 'mongoose';
import { NFT, NFTSchema } from './schemas/NFT.schema';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { HistoryReportModule } from './history-report/history-report.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/exception/exception.filter';
import { SeriesModule } from './series/series.module';
import { UsersModule } from './users/users.module';
import { FNftPoolModule } from './f-nft-pool/f-nft-pool.module';
import { ShareModule } from './share.module';
import { FNFTPool, FNFTPoolSchema } from './schemas/f-nft-pool.schema';
import { TieringPoolModule } from './tiering-pool/tiering-pool.module';
import { RewardPoolModule } from './reward-pool/reward-pool.module';
import { SocketModule } from './socket/socket.module';
import { UserManagementModule } from './user-management/user-management.module';
import { SignerModule } from './signer/signer.module';
import { PurchaseFNftModule } from './purchase-f-nft/purchase-f-nft.module';
import { ClaimRewardModule } from './claim-reward/claim-reward.module';
import { StageDefaultModule } from './stage-default/stage-default.module';
import { UpdateFNFTPoolTask } from './task/updateFNFTPool.task';
import { CustomFormat } from './common/custom-format.log';
import { ReceiveWalletAddressModule } from './receive-wallet-address/receive-wallet-address.module';
import { CommonModule } from './common-service/common.module';
import { RewardMultiplierModule } from './reward-multiplier/reward-multiplier.module';
import { PriceTokenModule } from './price-token/price-token.module';
import { TimeSettingModule } from './time-setting/time-setting.module';
import { TasksModule } from './task/task.module';
import { SystemWalletModule } from './system-wallet/system-wallet.module';
import { SettingWalletModule } from './setting-wallet/setting-wallet.module';
import { RegionModule } from './region/region.module';
import { LandModule } from './land/land.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({isGlobal:true}),
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName:'test',
      directConnection:true
    }),

    AuthModule,
    NftModule,
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
        CustomFormat,
      ),
      handleRejections: true,
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          filename: './logs/api-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    }),
   CommonModule,
   RegionModule,
   LandModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
