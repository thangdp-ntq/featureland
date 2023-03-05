import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, JwtToken, JwtTokenSchema } from '~/schemas';
import { AuthController } from './auth.controller';
import { CommonService } from '~/common-service/common.service';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JwtToken.name, schema: JwtTokenSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
    ]),
    // CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CommonService, EventsGateway],
})
/**
 * AuthModule
 */
export class AuthModule {}
