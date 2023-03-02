import { Logger } from '@nestjs/common';
import { BlockChain, MAX_RETRY, TIME_WAIT_RETRY } from '../common/constants';
import { Utils } from '../common/utils';
import { Web3ETH } from './web3.eth';

export interface IWeb3API {
  sign(data: any[], key: any): any;

  recover(data: any[], signature: string): any;

  createAccountSigner(): string;

  encrypt(data: any): Promise<any>;

  decrypt(data: any): Promise<any>;

  getDecimal(data: any): Promise<any>;

  getTransactionCount(): Promise<any>;

  createAccount(): Promise<any>;

  getBalance(data: any): Promise<any>;

  getTransactionReceipt(data: any): Promise<any>;

  getTransactionCountAddress(data: any): Promise<any>;

  estimateGas(data: any): Promise<any>;

  signTransaction(data: any, privateKey: string): Promise<any>;

  sendSignedTransaction(data: any);
}

export class Web3Gateway {
  private readonly logger = new Logger(Web3Gateway.name);

  private instance: IWeb3API;
  private instances = new Map<number, IWeb3API>();

  constructor(chainId: number) {
    if (!this.instances.has(chainId)) {
      if (BlockChain.Network.BSC.includes(chainId)) {
        this.instances.set(chainId, new Web3ETH());
      } else if (BlockChain.Network.ETH.includes(chainId)) {
        this.instances.set(chainId, new Web3ETH());
      } else {
        throw new Error('Not support this chain');
      }
    }

    this.instance = this.instances.get(chainId);
  }

  public async sign(data: any, key: any) {
    let retry = 1;
    while (true) {
      try {
        return this.instance.sign(data, key);
      } catch (error) {
        this.logger.warn(`sign(): Retrying ${retry} time. ${error.message}`);
        retry++;
        if (retry > 3) {
          throw error;
        }
        await Utils.wait(300);
      }
    }
  }

  public async recover(data: any, signature: string) {
    let retry = 1;
    while (true) {
      try {
        return this.instance.recover(data, signature);
      } catch (error) {
        this.logger.warn(`recover(): Retrying ${retry} time. ${error.message}`);
        retry++;
        if (retry > 3) {
          throw error;
        }
        await Utils.wait(300);
      }
    }
  }

  public async createAccountSigner() {
    return this.instance.createAccountSigner();
  }

  public async encrypt(data) {
    return await this.instance.encrypt(data);
  }

  public async decrypt(data) {
    return this.instance.decrypt(data);
  }

  public async getDecimal(data) {
    return this.instance.getDecimal(data);
  }

  public async getTransactionCount() {
    let retry = 1;
    while (true) {
      try {
        return this.instance.getTransactionCount();
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `getTransactionCount(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async createAccount() {
    let retry = 1;
    while (true) {
      try {
        return this.instance.createAccount();
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `createAccount(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async getTransactionCountAddress(address: string) {
    let retry = 1;
    while (true) {
      try {
        return this.instance.getTransactionCountAddress(address);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `getTransactionCountAddress(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  private isExceptionNeedRetry(error: Error) {
    if (
      error.toString().indexOf('CONNECTION ERROR') > -1 ||
      error.toString().indexOf('Invalid JSON RPC response') > -1 ||
      error.toString().indexOf('CONNECTION TIMEOUT') > -1 ||
      error.toString().indexOf('Maximum number of reconnect attempts reached') >
        -1 ||
      error.toString().indexOf('connection failure') > -1
    ) {
      return true;
    }
    return false;
  }

  public async getBalance(data) {
    let retry = 1;
    while (true) {
      try {
        return await this.instance.getBalance(data);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `getBalance(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async getTransactionReceipt(data: any) {
    let retry = 1;
    while (true) {
      try {
        return await this.instance.getTransactionReceipt(data);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `getTransactionReceipt(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async estimateGas(data: any) {
    let retry = 1;
    while (true) {
      try {
        return await this.instance.estimateGas(data);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `estimateGas(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async signTransaction(data: any, privateKey: string) {
    let retry = 1;
    while (true) {
      try {
        return await this.instance.signTransaction(data, privateKey);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `signTransaction(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }

  public async sendSignedTransaction(data: any) {
    let retry = 1;
    while (true) {
      try {
        return await this.instance.sendSignedTransaction(data);
      } catch (error) {
        if (!this.isExceptionNeedRetry(error)) {
          throw error;
        }
        this.logger.warn(
          `sendSignedTransaction(): Retrying ${retry} time. ${error.message}`,
        );
        retry++;
        if (retry > MAX_RETRY) {
          throw error;
        }
        await Utils.wait(TIME_WAIT_RETRY);
      }
    }
  }
}
