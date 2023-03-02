import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import {
  HistoryStaking,
  HistoryStakingSchema,
} from '../schemas/staking-history.schema';
import {
  FNFTPool,
  FNFTPoolSchema,
  PurchaseFNFT,
  PurchaseFNFTSchema,
} from '../schemas';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: HistoryStaking.name, schema: HistoryStakingSchema },
      { name: PurchaseFNFT.name, schema: PurchaseFNFTSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
    ]),
    CommonModule,
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService, EventsGateway],
})
export class UserManagementModule {}
