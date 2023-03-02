import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class Language {
  @ApiProperty({ type: String, example: 'Value in English' })
  @Prop({ type: String })
  en?: string;

  @ApiProperty({ type: String, example: 'Value in Japanese' })
  @Prop({ type: String })
  cn?: string;

  @ApiProperty({ type: String, example: 'Value in Chinese' })
  @Prop({ type: String })
  jp?: string;
}