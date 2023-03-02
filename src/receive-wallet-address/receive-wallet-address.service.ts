import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReceiveWalletAddress,
  ReceiveWalletAddressDocument,
} from '~/schemas/receive-wallet-address.schema';
import { UpdateReceiveWalletAddresstDto } from './dto/receive-wallet-address.dto';

@Injectable()
export class ReceiveWalletAddressService {
  constructor(
    @InjectModel(ReceiveWalletAddress.name)
    private receiveWalletAddress: Model<ReceiveWalletAddressDocument>,
  ) {}
  async findWallet() {
    return await this.receiveWalletAddress.findOne();
  }

  async update(updateReceiveWalletAddressDto: UpdateReceiveWalletAddresstDto) {
    const isReceiveWalletAddress = await this.receiveWalletAddress.findOne();
    if (!isReceiveWalletAddress) {
      return await this.receiveWalletAddress.create(
        updateReceiveWalletAddressDto,
      );
    } else {
      await this.receiveWalletAddress.updateOne(
        { _id: isReceiveWalletAddress._id },
        updateReceiveWalletAddressDto,
      );
    }
    return updateReceiveWalletAddressDto;
  }
}
