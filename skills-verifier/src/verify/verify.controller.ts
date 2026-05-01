import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { VerifyService } from './verify.service';

export interface VerifyWebhookDto {
  cvId: number;
  owner: string;
  skills: string[];
  callbackUrl: string;
}

@Controller()
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Post('verify')
  @HttpCode(202)
  async verify(@Body() body: VerifyWebhookDto) {
    // Réponse immédiate au webhook → le traitement est asynchrone
    this.verifyService.processAsync(body);
    return { status: 'accepted', message: 'Verification started' };
  }
}
