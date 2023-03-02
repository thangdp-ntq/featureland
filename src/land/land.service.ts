import { Injectable } from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';

@Injectable()
export class LandService {
  create(createLandDto: CreateLandDto) {
    return 'This action adds a new land';
  }

  findAll() {
    return `This action returns all land`;
  }

  findOne(id: number) {
    return `This action returns a #${id} land`;
  }

  update(id: number, updateLandDto: UpdateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
