import {
  Controller,
  Get,
  Body,
  Put,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReceiveWalletAddressService } from './receive-wallet-address.service';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  API_SUCCESS,
  RECEIVE_WALLET_ADDRESS_MESSAGE,
} from '~/common/constants';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../schemas';
import { Roles } from '../auth/roles.decorator';
import { Web3Guard } from '../auth/web3.guard';
import { UpdateReceiveWalletAddresstDto } from './dto/receive-wallet-address.dto';

@Controller('admin/receive-wallet-address')
@ApiSecurity('token')
@ApiTags('SUPPER ADMIN Receive Wallet Address')
export class ReceiveWalletAddressController {
  constructor(
    private readonly receiveWalletAddressService: ReceiveWalletAddressService,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Get Receive Wallet Address' })
  async findWallet() {
    const receiveWalletAddress =
      await this.receiveWalletAddressService.findWallet();
    return {
      code: API_SUCCESS,
      data: receiveWalletAddress || '',
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put('')
  @ApiOperation({ summary: 'Update Receive Wallet Address' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        data: {
          type: 'object',
          example: {
            address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
            _id: '62a83edaf178650ab604e71b',
            createdAt: '2022-06-14T07:55:06.138Z',
            updatedAt: '2022-06-14T07:55:06.138Z',
          },
        },

        message: {
          type: 'string',
          example:
            RECEIVE_WALLET_ADDRESS_MESSAGE.CREATE_UPDATE_RECEIVE_WALLET_ADDRESS,
        },
      },
    },
  })
  async update(
    @Body() updateReceiveWalletAddresstDto: UpdateReceiveWalletAddresstDto,
  ) {
    const receiveWallet = await this.receiveWalletAddressService.update(
      updateReceiveWalletAddresstDto,
    );
    return {
      code: API_SUCCESS,
      data: receiveWallet,
      message:
        RECEIVE_WALLET_ADDRESS_MESSAGE.CREATE_UPDATE_RECEIVE_WALLET_ADDRESS,
    };
  }
}
