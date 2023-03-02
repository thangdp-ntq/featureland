import { CommonService } from '~/common-service/common.service';
import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommonCode,
  USERNAME_DEFAULT,
  USERNAME_WEB_DEFAULT,
} from '../common/constants';
import {
  User,
  UserDocument,
  UserRole,
  JwtToken,
  JwtTokenDocument,
} from '~/schemas';
import { ConnectWalletDto, LoginDto } from './dto/login.dto';
import { Utils } from '../common/utils';
import { Web3ETH } from '../blockchain/web3.eth';
import { ApiSuccessResponse } from '../common/responses/api-success';
import { ethers } from 'ethers';
import { Web3Gateway } from '../blockchain/web3.gateway';
import { JwtService } from '@nestjs/jwt';
import ObjectID from 'bson-objectid';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { HttpError } from '~/common/responses/api-errors';
@Injectable()
/**
 * AuthService
 */
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(JwtToken.name) private jwtToken: Model<JwtTokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login
   * @param {LoginDto} requestData
   * @return {any} user information
   */
  async connectWallet(params: ConnectWalletDto) {
    const session = await this.userModel.startSession();
    try {
      const role = UserRole.USER;
      const hashData = ethers.utils.solidityKeccak256(
        ['address'],
        [params.walletAddress],
      );

      const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
      const addressRecover = await web3Gateway.recover(
        hashData,
        params.signature,
      );

      const isAddressValid = ethers.utils.isAddress(params.walletAddress);
      if (addressRecover.toLowerCase() === params.walletAddress.toLowerCase()) {
        let user = await this.userModel.findOne({
          address: Utils.queryInsensitive(params.walletAddress),
        });
        if (!user) {
          const data = {
            address: params.walletAddress,
            role,
            username: USERNAME_WEB_DEFAULT + new Date().getTime(),
          };
          user = await this.userModel.create(data);
          await user.save();
        }
        const accessToken = await this._generateAccessToken(user, '');
        return accessToken;
      } else {
        this.logger.error("Current wallet isn't user");
        throw CommonCode.NOT_USER;
      }
    } catch (error) {
      this.logger.debug(error);
      throw HttpStatus.BAD_REQUEST;
    } finally {
      await session.endSession();
    }
  }

  async logout(token: string, hashToken: string) {
    try {
      const jwtToken = await this.jwtToken.findOne({ hashToken });
      if (jwtToken) {
        const [tokenStored, tokenHeader] = await Promise.all([
          this.jwtService.decode(jwtToken.token) as Record<string, any>,
          this.jwtService.decode(token) as Record<string, any>,
        ]);

        if (tokenHeader && tokenStored && tokenHeader.id === tokenStored.id) {
          await Promise.all([
            await jwtToken.remove(),
            // await this.cacheManager.del(token),
          ]);

          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private async _generateAccessToken(user: UserDocument, signature: string) {
    const accessTokenExpiredIn = +process.env.JWT_EXPIRATION_TIME;
    const hashToken = this._generateHashToken(user.id);
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
        address: user.address,
        signature,
        hashToken,
      },
      { expiresIn: accessTokenExpiredIn },
    );
    return {
      token: accessToken,
      expiresIn: accessTokenExpiredIn,
      hashToken,
      role: user.role,
    };
  }

  private _generateHashToken(userId: number): string {
    const hashToken = new ObjectID(userId);
    return hashToken.toHexString();
  }
}
