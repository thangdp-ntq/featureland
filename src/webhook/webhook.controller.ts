import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtTokenGuard } from '../auth/jwt-token.guard';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(@Body() data: any) {
    try {
      console.log(data)
       await this.webhookService.processWebhook(data);
      throw 1;
    } catch (error) {
      throw error;
    }
  }
}
