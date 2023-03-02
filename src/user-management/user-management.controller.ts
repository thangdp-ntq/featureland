import { RolesGuard } from './../auth/roles.guard';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { isMongoId } from 'class-validator';
import { UserRole } from '~/schemas';
import { Roles } from '../auth/roles.decorator';
import { Web3Guard } from '../auth/web3.guard';
import {
  ADMIN_NOT_FOUND,
  API_ERROR,
  API_SUCCESS,
  messsage,
  USER_NOT_FOUND,
} from '../common/constants';
import { HttpError } from '../common/responses/api-errors';
import {
  AnalysisUserDetail,
  GetUserManagement,
} from './dto/get-user-management.dto';
import { ResponseGetUser } from './responses/respone.dto';
import { UserManagementService } from './user-management.service';

@Controller('admin/user-management')
@ApiTags('Admin user management')
@ApiSecurity('token')
@UseGuards(Web3Guard, RolesGuard)
@Roles(...[UserRole.ADMIN, UserRole.SUPPER_ADMIN])
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    properties: {
      code: { type: 'string', example: API_ERROR },
      message: { type: 'string', example: 'unauthorized' },
      errors: { type: 'array', example: ['You are unauthorized'] },
    },
  },
})
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: ResponseGetUser })
  async findAll(@Query() params: GetUserManagement) {
    const users = await this.userManagementService.findAll(params);
    return ResponseGetUser.success(users);
  }

  @Get('analysis/:id')
  async analysisUser(
    @Query() query: AnalysisUserDetail,
    @Param('id') id: string,
  ) {
    if (!isMongoId(id))
      throw HttpError.error(HttpStatus.NOT_FOUND, messsage.ID_INVALID, [
        messsage.ID_INVALID,
      ]);
    const analysisUser = await this.userManagementService.analysisUser(
      id,
      query,
    );
    return {
      code: API_SUCCESS,
      data: analysisUser,
    };
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: ADMIN_NOT_FOUND },
        errors: { type: 'array', example: [ADMIN_NOT_FOUND] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: messsage.ID_INVALID },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        data: {
          type: 'string',
          example: {
            activeLogs: [
              {
                _id: '6269f8d996f49dbdf715d332',
                userAddress: '0x41fD52b4a8104Df1f6e0e51Fa670Ed8894a2bE9d',
                value: 1000,
                type: 1,
                balance: 1000,
                createdAt: '2022-04-28T02:15:53.477Z',
                updatedAt: '2022-04-28T02:15:53.477Z',
              },
            ],
            address: '0x41fD52b4a8104Df1f6e0e51Fa670Ed8894a2bE9d',
            joinDate: '2022-04-28T02:15:53.473Z',
            balance: 1000,
          },
        },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    if (!isMongoId(id))
      throw HttpError.error(HttpStatus.NOT_FOUND, messsage.ID_INVALID, [
        messsage.ID_INVALID,
      ]);
    const user = await this.userManagementService.findOne(id);
    if (user === USER_NOT_FOUND)
      throw HttpError.error(HttpStatus.NOT_FOUND, USER_NOT_FOUND, [
        USER_NOT_FOUND,
      ]);
    return {
      code: API_SUCCESS,
      data: user,
    };
  }
}
