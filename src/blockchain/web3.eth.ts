import { Logger } from '@nestjs/common';
import { Utils } from '../common/utils';
import Web3Type from 'web3';
import { IWeb3API } from './web3.gateway';
import * as jsonAbi1155 from '../common/abi/abi.json';
import * as jsonErc20Abi from '../common/abi/erc20_abi.json';
const Web3 = require('web3');
import * as crypto from 'crypto-js';
import { AwsUtils } from '~/common/aws.util';

export class Web3ETH implements IWeb3API {
  private readonly logger = new Logger(Web3ETH.name);

  private web3Instance: Web3Type | any;

  constructor() {
    if (!this.web3Instance) {
      this.web3Instance = new Web3();
    }
    this.setProvider();
    return this;
  }

  private setProvider() {
    const rpcUrl = Utils.getRandom(process.env.CHAIN_RPC_URL.split(','));
    this.web3Instance.setProvider(rpcUrl);
  }

  public getContractInstance() {
    return new this.web3Instance.eth.Contract(
      jsonAbi1155.output.abi,
      process.env.CONTRACT_PROXY,
    );
  }

  public getContractErc20Instance(tokenAddress) {
    this.logger.debug("Get contract ERC20");
    this.logger.debug(jsonErc20Abi);
    return new this.web3Instance.eth.Contract(jsonErc20Abi, tokenAddress);
  }

  public createAccount() {
    try {
      return this.web3Instance.eth.accounts.create();
    } catch (error) {
      throw error;
    }
  }

  public getBalance(address: string) {
    try {
      return this.web3Instance.eth.getBalance(address);
    } catch (error) {
      throw error;
    }
  }

  public getTransactionCountAddress(address: string) {
    try {
      return this.web3Instance.eth.getTransactionCount(address);
    } catch (error) {
      throw error;
    }
  }

  public estimateGas(data: any) {
    try {
      return this.web3Instance.eth.estimateGas(data);
    } catch (error) {
      throw error;
    }
  }

  public signTransaction(data: any, privateKey: string) {
    try {
      return this.web3Instance.eth.accounts.signTransaction(data, privateKey);
    } catch (error) {
      throw error;
    }
  }

  public sendSignedTransaction(data: any) {
    try {
      return this.web3Instance.eth.sendSignedTransaction(data);
    } catch (error) {
      throw error;
    }
  }

  private convertDataSign(data: any[]) {
    const dataSign: any = [];
    for (let index = 0; index < data.length; index++) {
      const value = data[index];
      if (typeof value === 'number') {
        dataSign.push({
          type: 'uint256',
          value: value,
        });
      } else if (typeof value === 'string') {
        if (this.web3Instance.utils.isAddress(value)) {
          dataSign.push({
            type: 'address',
            value: value,
          });
        } else if (value.startsWith('0x')) {
          dataSign.push({
            type: 'bytes',
            value: value,
          });
        } else {
          dataSign.push({
            type: 'bytes',
            value: Utils.convertToBytes(value),
          });
        }
      } else if (this.web3Instance.utils.isBigNumber(value)) {
        dataSign.push({
          type: 'uint256',
          value: Utils.convertNumberToNoExponents(value.toString()),
        });
      }
    }
    this.logger.debug('convertDataSign(): dataSign', JSON.stringify(dataSign));
    return dataSign;
  }

  public sign(data: any[], key: any) {
    try {
      const dataSign = this.convertDataSign(data);
      const hash = this.web3Instance.utils.soliditySha3(...dataSign);
      const sign = this.web3Instance.eth.accounts.sign(hash, key);
      this.logger.debug('sign(): sign', sign);
      return sign.signature;
    } catch (error) {
      this.setProvider();
      throw error;
    }
  }

  public recover(data: any, signature: string) {
    try {
      return this.web3Instance.eth.accounts.recover(data, signature);
    } catch (error) {
      this.setProvider();
      throw error;
    }
  }

  public createAccountSigner() {
    try {
      return this.web3Instance.eth.accounts.create();
    } catch (error) {
      throw error;
    }
  }

  public async encrypt(data) {
    return await AwsUtils.encrypt(data);
    // return await crypto.AES.encrypt(data, process.env.KEY_ENCRYPT);
  }

  public async decrypt(data) {
    return await AwsUtils.decrypt(data);
    // const bytes = await crypto.AES.decrypt(data, process.env.KEY_ENCRYPT);
    // const originalText = bytes.toString(crypto.enc.Utf8);
    // return originalText;
  }

  public async getDecimal(tokenAddress) {
    const contractProxy = new Web3ETH().getContractErc20Instance(tokenAddress);
    this.logger.debug(JSON.stringify(contractProxy));
    const symbol = await contractProxy.methods.symbol().call();
    const decimals = await contractProxy.methods.decimals().call();
    return { symbol, decimals };
  }

  public async getTransactionCount() {
    const contractProxy = new Web3ETH().getContractInstance();
    return contractProxy.methods.nonceSignature().call();
  }

  public async getTransactionReceipt(hash: any) {
    try {
      const transactionReceipt =
        await this.web3Instance.eth.getTransactionReceipt(hash);
      return transactionReceipt.status;
    } catch (error) {
      throw error;
    }
  }
}
