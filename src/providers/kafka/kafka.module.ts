import { Module } from '@nestjs/common';
import { KafkaController } from './kafka.controller';

@Module({
  controllers: [KafkaController],
  providers: [],
})
export class KafkaModule {}
