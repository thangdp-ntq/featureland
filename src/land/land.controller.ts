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
  UseGuards,
  Req,
} from "@nestjs/common";
import { LandService } from "./land.service";
import { AddNFTDto, RemoveNFTDto } from "./dto/create-land.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetNFTSResponse } from "~/nft/dto/response.dto";
import { GetLand } from "./dto/get-land.dto";
import { API_SUCCESS, CommonCode } from "~/common/constants";
import { Web3Guard } from "~/auth/web3.guard";

@ApiTags("Land")
@Controller("land")
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  @ApiOperation({
    summary: "Get All Land",
  })
  findAll(@Query() getParams: GetLand) {
    return this.landService.findAll();
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: "string", example: API_SUCCESS },
        message: {
          type: "string",
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiOperation({
    summary: "Get Region by Id",
  })
  findOne(@Param("id") id: string) {
    return this.landService.findOne(id);
  }

  @UseGuards(Web3Guard)
  @Post(":id/nft")
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: "string", example: API_SUCCESS },
        message: {
          type: "string",
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: "object", example: {} },
      },
    },
  })
  addNft(@Param("id") id: string, @Body() tokenIds: AddNFTDto, @Req() req) {
    return this.landService.addNft(id, tokenIds.tokenIds, req.address);
  }

  // @Post(":id/remove-nft")
  // @ApiResponse({ status: HttpStatus.OK, schema: {
  //   properties: {
  //     code: { type: 'string', example: API_SUCCESS },
  //     message: {
  //       type: 'string',
  //       example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
  //     },
  //     data: { type: 'object', example: {} },
  //   },
  // } })
  // findOne2(@Param("id") id: string,@Body() tokens:RemoveNFTDto) {
  //   return this.landService.findOne(id);
  // }
}
