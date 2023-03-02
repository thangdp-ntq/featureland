import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UserResult } from './responses/api-response';
import { RolesGuard } from '~/auth/roles.guard';
import { UserRole } from '~/schemas';
import { JwtAuthGuard } from '~/auth/jwt-auth.guard';
import { Roles } from '~/auth/roles.decorator';

@ApiExcludeController()
@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOkResponse({ type: UserResult })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return UserResult.success(user);
  }

  @Get()
  findAll(@Query() requestData: SearchUserDto) {
    return this.usersService.findAll(requestData);
  }
}
