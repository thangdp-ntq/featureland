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
import { HttpError } from "~/common/responses/api-errors";

@ApiTags("Land")
@Controller("land")
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  @ApiOperation({
    summary: "Get All Land",
  })
  async findAll(@Query() getParams: GetLand) {
    const lands = await this.landService.findAll({ ...getParams });
    return GetNFTSResponse.success(lands);
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
  async addNft(
    @Param("id") id: string,
    @Body() tokenIds: AddNFTDto,
    @Req() req
  ) {
    try {
      const res = await this.landService.addNft(
        id,
        tokenIds.tokenIds,
        req.address
      );
      return res;
    } catch (error) {
      throw HttpError.error(HttpStatus.BAD_REQUEST, error, []);
    }
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
