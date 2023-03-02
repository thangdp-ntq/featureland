import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TiersResponse } from './dto/response.dto';
import { TieringStructureService } from './tiering-structure.service';
@Controller('user/tiering-structure')
@ApiTags('Users')
export class TieringStructureUser {
  constructor(private readonly tiersService: TieringStructureService) {}

  @Get()
  @ApiOperation({ summary: 'Get tiering structure data' })
  @ApiResponse({ status: 200, type: TiersResponse })
  async getTieringStructure() {
      const res =  await this.tiersService.getTiersUser();
    return res; 
  }
}
