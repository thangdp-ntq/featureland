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
