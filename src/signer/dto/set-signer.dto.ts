import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SetSignerEventDto {
    @ApiProperty({ required: true })
    @IsString()
    signer: string;
}

export class SetSignerDto {
    @ApiProperty({ required: true })
    @IsString()
    secretKey: string;
}