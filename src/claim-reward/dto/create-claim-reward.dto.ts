import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class CreateClaimRewardDto {
    @ApiProperty({
        required: true,
        example: '',
        description: 'String of object poolName',
      })
      @IsNotEmpty()
      @IsString()
      @IsEthereumAddress()
      userWalletAddress: string;

      @ApiProperty({
        required: true,
        example: '',
        description: 'String of object poolName',
      })
      @IsNotEmpty()
      @IsString()
      @Matches(/^\d*\.?\d+$/, {
        message: 'amount must be number',
      })
      amount: string


      @ApiProperty({
        required: true,
        example: 1,
        description: 'String of object poolName',
      })
      @IsNotEmpty()
      @IsNumber()
      rewardPoolId: number

}
