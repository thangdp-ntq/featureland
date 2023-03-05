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
}
