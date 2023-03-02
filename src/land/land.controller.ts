import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { LandService } from "./land.service";
import { AddNFTDto,  RemoveNFTDto } from "./dto/create-land.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetNFTSResponse } from "~/nft/dto/response.dto";
import { GetLand } from "./dto/get-land.dto";
import { API_SUCCESS, CommonCode } from "~/common/constants";

@ApiTags("Land")
@Controller("land")
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  @ApiOperation({
    summary:
      'Get All Land',
  })
  findAll(@Query() getParams: GetLand) {
    return this.landService.findAll();
  }

  @Get(":id")
  @ApiResponse({ status: HttpStatus.OK, schema: {
    properties: {
      code: { type: 'string', example: API_SUCCESS },
      message: {
        type: 'string',
        example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      },
      data: { type: 'object', example: {} },
    },
  }  })
  @ApiOperation({
    summary:
      'Get Region by Id',
  })
  findOne(@Param("id") id: string) {
    return this.landService.findOne(+id);
  }

  @Post(":id/add-nft")
  @ApiResponse({ status: HttpStatus.OK, schema: {
    properties: {
      code: { type: 'string', example: API_SUCCESS },
      message: {
        type: 'string',
        example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      },
      data: { type: 'object', example: {} },
    },
  } })
  findOne1(@Param("id") id: string,@Body() tokens:AddNFTDto) {
    return this.landService.findOne(+id);
  }

  @Post(":id/remove-nft")
  @ApiResponse({ status: HttpStatus.OK, schema: {
    properties: {
      code: { type: 'string', example: API_SUCCESS },
      message: {
        type: 'string',
        example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      },
      data: { type: 'object', example: {} },
    },
  } })
  findOne2(@Param("id") id: string,@Body() tokens:RemoveNFTDto) {
    return this.landService.findOne(+id);
  }
}
