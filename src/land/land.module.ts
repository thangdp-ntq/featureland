import { Module } from "@nestjs/common";
import { LandService } from "./land.service";
import { LandController } from "./land.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Land, LandSchema } from "~/schemas/land.schema";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "~/common-service/common.module";
import { EventsGateway } from "~/socket/socket.gateway";
import { NFT, NFTSchema } from "~/schemas";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forFeature([
      { name: Land.name, schema: LandSchema },
      { name: NFT.name, schema: NFTSchema },
    ]),
    CommonModule,
  ],
  controllers: [LandController],
  providers: [LandService, EventsGateway],
})
export class LandModule {}
