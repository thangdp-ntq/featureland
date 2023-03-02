import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString } from 'class-validator';

export class UpdateReceiveWalletAddresstDto {
  @ApiProperty({
    type: String,
    example: '0xC95fE6812cCF43e6Ae3817189e1B406ea8b78A7C',
  })
  @IsString()
  @IsEthereumAddress()
  address: string;
}
