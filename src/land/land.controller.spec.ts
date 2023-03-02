import { Test, TestingModule } from '@nestjs/testing';
import { LandController } from './land.controller';
import { LandService } from './land.service';

describe('LandController', () => {
  let controller: LandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandController],
      providers: [LandService],
    }).compile();

    controller = module.get<LandController>(LandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
