import { Injectable } from '@nestjs/common';

@Injectable()
export class LandService {
  create(createLandDto) {
    return 'This action adds a new land';
  }

  findAll() {
    return `This action returns all land`;
  }

  findOne(id: number) {
    return `This action returns a #${id} land`;
  }

  update(id: number, updateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
