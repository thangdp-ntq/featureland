import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { SearchDto } from '../../common/search.dto';

export class SearchUserDto extends PartialType(SearchDto) {
  @ApiProperty({ type: String, example: 'address' })
  address: string;
}
