import { ApiProperty } from "@nestjs/swagger";

export class AddNFTDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: String,
    example: [1, 2, 3],
  })
  tokenIds: string;
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
