import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example: 'address-string',
  })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example:
      '0x829dcc77d303d985472447c6f84f773630eec4653f44b72adee1db638284612a0b009f9d52be76c5b7f8eb61413bbce40a5db622297feac910dbebc223ba74d21b',
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}

export class ConnectWalletDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example: 'address-string',
  })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example:
      '0x829dcc77d303d985472447c6f84f773630eec4653f44b72adee1db638284612a0b009f9d52be76c5b7f8eb61413bbce40a5db622297feac910dbebc223ba74d21b',
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
