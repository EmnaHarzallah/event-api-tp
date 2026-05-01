import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SkillsResultDto {
  cvId: number;
  owner: string;
  status: 'verified' | 'unverified';
  results: {
    skill: string;
    repoCount: number;
    score: number;
    verified: boolean;
  }[];
  averageScore: number;
  verifiedSkills: string[];
  unverifiedSkills: string[];
}

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Post('skills-result')
  @HttpCode(200)
  receiveSkillsResult(@Body() result: SkillsResultDto) {
    console.log(
      `[Webhook] Received skills result for CV #${result.cvId} — ` +
      `score: ${result.averageScore}/10 — ` +
      `verified: [${result.verifiedSkills.join(', ')}]`,
    );

    // Propage le résultat dans l'event bus interne → SSE le récupère
    this.eventEmitter.emit('cv.skills.verified', result);

    return { received: true };
  }
}
