import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  API_ERROR,
  API_SUCCESS,
  SERIAL_RESPONSE_MESSAGE,
} from '../../common/constants';

export class DeleteSuccess {}

export class UnAuthorized {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'Invalid token' })
  message: string;
}

export class SerialNotFound {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  code: number;

  @ApiProperty({ example: 'Serial not found' })
  message: string;
}

export class ResponseDeleteSerialSuccess {
  @ApiProperty({ example: API_SUCCESS })
  code: number;

  @ApiProperty({ example: SERIAL_RESPONSE_MESSAGE.SERIAL_DELETE_SUCCESS })
  message: string;
}
