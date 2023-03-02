import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '~/schemas';

export class CreateUserDto {
  @ApiProperty({ type: String, example: 'abcxyz' })
  address: string;

  @ApiProperty({ type: String, enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;
}
