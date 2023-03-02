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
  @UseGuards(JwtTokenGuard)
  async webhook(@Body() data: any) {
    try {
      return await this.webhookService.processWebhook(data);
    } catch (error) {
      throw error;
    }
  }
}
