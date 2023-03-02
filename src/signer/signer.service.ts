import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Signer } from '../schemas/signer.schema';
import { SetSignerDto } from './dto/set-signer.dto';
import { Model } from 'mongoose';
import {
  BlockChain,
  BLOCKCHAIN_NETWORK,
  SIGNER_RESPONSE,
} from '../common/constants';
import { Web3Gateway } from '../blockchain/web3.gateway';

@Injectable()
export class SignerService {
  constructor(
    @InjectModel(Signer.name) private readonly signerModel: Model<Signer>,
  ) {}
  async createSigner(data: SetSignerDto) {
    try {
      if (data.secretKey !== process.env.SECRET_KEY_SIGNER) {
        throw SIGNER_RESPONSE.SECRET_KEY_IN_VALID;
      }
      let network = '';
      if (BlockChain.Network.BSC.includes(+process.env.CHAIN_ID)) {
        network = BLOCKCHAIN_NETWORK.BSC;
      }
      const signer = await this.signerModel.findOne({ chain: network });
      const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
      const account = await web3Gateway.createAccountSigner();
      const hashKey = await web3Gateway.encrypt(account['privateKey']);
      if (!signer) {
        return await this.signerModel.create({
          signer: account['address'],
          hashKey: hashKey,
          chain: network,
        });
      } else {
        signer.signer = account['address'];
        signer.hashKey = hashKey;
        await signer.save();
      }
    } catch (error) {
      throw error;
    }
  }

  async getSigner(chain) {
    return await this.signerModel.findOne({ chain: chain });
  }
}
