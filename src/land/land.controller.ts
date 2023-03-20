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
import { ApiSuccessResponse } from "~/common/responses/api-success";

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

  // @Post('dump')
  // dummyData(){
  //   return this.landService.dumpData()
  // }

  // @Get(":id/top-land")
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   schema: {
  //     properties: {
  //       code: { type: "string", example: API_SUCCESS },
  //       message: {
  //         type: "string",
  //         example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
  //       },
  //       data: { type: "object", example: {} },
  //     },
  //   },
  // })
  // @ApiOperation({
  //   summary: "Get Region by Id",
  // })
  // async topLand(@Param("id") id: string) {
  //   const topOwner = await this.landService.topLand(id);
  //   return new ApiSuccessResponse<unknown>().success(topOwner, "");
  // }

  @Get(":id/top-owner")
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
  async topOwner(@Param("id") id: string) {
    const topOwner = await this.landService.topOwner(id);
    return new ApiSuccessResponse<unknown>().success(topOwner, "");
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
  async findOne(@Param("id") id: string) {
    const land = await this.landService.findOne(id);
    return new ApiSuccessResponse<unknown>().success(land[0], "");
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
    @Body() bodyAddNFt: AddNFTDto,
    @Req() req
  ) {
    try {
      const res = await this.landService.addNft(
        id,
        bodyAddNFt.tokenIds,
        req.address,
        bodyAddNFt.index
      );
      return res;
    } catch (error) {
      throw HttpError.error(HttpStatus.BAD_REQUEST, error, []);
    }
  }

  @Post(":id/remove-nft")
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
  async findOne2(
    @Param("id") id: string,
    @Body() bodyRemoveNFt: RemoveNFTDto,
    @Req() req
  ) {
    try {
      const res = await this.landService.removeNft(
        id,
        bodyRemoveNFt.tokenIds,
        req.address
      );
      return res;
    } catch (error) {
      throw HttpError.error(HttpStatus.BAD_REQUEST, error, []);
    }
  }
}
