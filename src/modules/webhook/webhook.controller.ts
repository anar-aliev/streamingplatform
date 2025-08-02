import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('livekit')
  @HttpCode(HttpStatus.OK)
  public async receiveWebHookLivekit(
    @Body() body: string,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    return this.webhookService.receiveWebHookLivekit(body, authorization);
  }
}
