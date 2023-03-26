import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsOptional } from "class-validator";

export class AddNFTDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    example: [1, 2, 3],
  })
  tokenIds: number[];

  @IsOptional()
  @ApiProperty({
    type: String,
    example: 1,
  })
  index: number;

  @IsOptional()
  @ApiProperty({
    type: String,
    example: 1,
  })
  address: string;
}

export class RemoveNFTDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example: [1, 2, 3],
  })
  tokenIds: string;
}
