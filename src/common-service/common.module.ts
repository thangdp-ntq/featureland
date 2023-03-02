import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { CommonService } from './common.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
    ]),
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
