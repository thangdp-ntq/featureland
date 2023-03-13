import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from "@nestjs/common";
import { RegionService } from "./region.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetNFTSResponse } from "~/nft/dto/response.dto";
import { ApiSuccessResponse } from "~/common/responses/api-success";
import { API_SUCCESS, CommonCode } from "~/common/constants";

@ApiTags("Region")
@Controller("region")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @ApiOperation({
    summary: "Get All Region",
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  @Get()
  async findAll() {
    const regions = await this.regionService.findAll();
    return new ApiSuccessResponse<unknown>().success(regions, "");
  }

  @ApiOperation({
    summary: "Get  Region",
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  @Get(':id')
  async findOne(@Param("id") id: string) {
    console.log(id)
    const region = await this.regionService.findOne({id});
    return new ApiSuccessResponse<unknown>().success(region, "");
  }

  @Get(":id/top-land")
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
  async topLand(@Param("id") id: string) {
    const topOwner = await this.regionService.topLand(id);
    return new ApiSuccessResponse<unknown>().success(topOwner, "");
  }

}
