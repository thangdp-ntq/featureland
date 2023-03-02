import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { LandService } from "./land.service";
import { CreateLandDto } from "./dto/create-land.dto";
import { UpdateLandDto } from "./dto/update-land.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Land")
@Controller("land")
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get()
  findAll() {
    return this.landService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.landService.findOne(+id);
  }

  @Post("/add-nft")
  findOne1(@Param("id") id: string) {
    return this.landService.findOne(+id);
  }

  @Post("/remove-nft")
  findOne2(@Param("id") id: string) {
    return this.landService.findOne(+id);
  }
}
