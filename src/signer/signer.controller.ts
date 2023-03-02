import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetSignerDto } from './dto/set-signer.dto';
import { SignerService } from './signer.service';

@Controller('signer')
@ApiTags('Signer')
export class SignerController {
  constructor(private readonly signerService: SignerService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'genSigner' })
  @ApiExcludeEndpoint()
  async genSigner(@Query() data: SetSignerDto) {
    return await this.signerService.createSigner(data);
  }
}
