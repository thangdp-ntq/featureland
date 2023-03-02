import { Controller, Get, Body, Put, HttpStatus, UseGuards } from '@nestjs/common';
import { StageDefaultService } from './stage-default.service';
import { UpdateStageDefaultDto } from './dto/update-stage-default.dto';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_SUCCESS, STAGE_DEFAULT_RESPONE_MESSAGE } from '~/common/constants';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../schemas';
import { Roles } from '../auth/roles.decorator';
import { Web3Guard } from '../auth/web3.guard';

@Controller('admin/stage-default')
@ApiSecurity('token')
@UseGuards(Web3Guard, RolesGuard)
@Roles(...[UserRole.SUPPER_ADMIN,UserRole.ADMIN])
@ApiTags('Stage Default')
export class StageDefaultAdminController {
  constructor(private readonly stageDefaultService: StageDefaultService) {}
  @Get()
  async findAll() {
    const stageDefault = await this.stageDefaultService.findAll();
    return {
      code: API_SUCCESS,
      data: stageDefault,
    };
  }

  @Put('')
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        data: {
          type: 'object',
          example: {
            timelines: [
              {
                en: 'abc',
                cn: 'abc',
                jp: 'abc',
              },
            ],
            _id: '62a83edaf178650ab604e71b',
            createdAt: '2022-06-14T07:55:06.138Z',
            updatedAt: '2022-06-14T07:55:06.138Z',
          },
        },

        message: {
          type: 'string',
          example: STAGE_DEFAULT_RESPONE_MESSAGE.CREATE_STAGE_DEFAULT,
        },
      },
    },
  })
  async update(@Body() updateStageDefaultDto: UpdateStageDefaultDto) {
    const stageDefault = await this.stageDefaultService.update(
      updateStageDefaultDto,
    );
    return {
      code: API_SUCCESS,
      data: stageDefault,
      message: STAGE_DEFAULT_RESPONE_MESSAGE.CREATE_STAGE_DEFAULT,
    };
  }
}
