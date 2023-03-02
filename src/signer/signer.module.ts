import { Module } from '@nestjs/common';
import { SignerService } from './signer.service';
import { SignerController } from './signer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Signer, SignerSchema } from '../schemas/signer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Signer.name, schema: SignerSchema },
    ]),
  ],
  providers: [SignerService],
  controllers: [SignerController]
})
export class SignerModule {}
