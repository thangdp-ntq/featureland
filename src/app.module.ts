import { CacheModule, CacheModuleOptions, Module, Scope } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NftModule } from './nft/nft.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/exception/exception.filter';
import { CustomFormat } from './common/custom-format.log';
import { CommonModule } from './common-service/common.module';
import { RegionModule } from './region/region.module';
import { LandModule } from './land/land.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: (): CacheModuleOptions => {
        const options = {
          store: redisStore,
          ttl: Number(process.env.REDIS_TTL),
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT || 6379),
        };

        return options;
      },
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName:'featureland',
      directConnection:true,
      user:'featureland',
      pass:'featureland'
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
