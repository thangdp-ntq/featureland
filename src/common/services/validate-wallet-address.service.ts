import { Injectable } from '@nestjs/common';
import { Web3ETH } from '~/blockchain/web3.eth';
import { CommonCode } from '../constants';

@Injectable()
export class ValidateAddressWalletService {
  async isTokenAddress(
    tokenAddress: string,
    dataSymbol: string,
    dataDecimals?: any,
  ) {
    try {
      const contractProxy = new Web3ETH().getContractErc20Instance(
        tokenAddress,
      );
      const symbol = await contractProxy.methods.symbol().call();
      const decimals = await contractProxy.methods.decimals().call();
      return {
        isValid: !(
          symbol.toUpperCase() !== dataSymbol.toUpperCase() ||
          (dataDecimals ? decimals !== dataDecimals : true)
        ),
        message:
          symbol !== dataSymbol ||
          (dataDecimals ? decimals !== dataDecimals : false)
            ? CommonCode.INVALID_TOKEN
            : '',
      };
    } catch (error) {
      throw error;
    }
  }
}
