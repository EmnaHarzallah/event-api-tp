import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { CvEventPayload } from '../events/cv-event.payload';

const SKILLS_VERIFIER_URL = 'http://localhost:3001/verify';
const CVTECH_CALLBACK_URL = 'http://localhost:3000/webhooks/skills-result';

@Injectable()
export class WebhookService {

  @OnEvent('cv.created')
  async handleCvCreated(payload: CvEventPayload): Promise<void> {
    await this.sendToSkillsVerifier(payload);
  }

  @OnEvent('cv.updated')
  async handleCvUpdated(payload: CvEventPayload): Promise<void> {
    await this.sendToSkillsVerifier(payload);
  }

  private async sendToSkillsVerifier(payload: CvEventPayload): Promise<void> {
    const body = {
      cvId: payload.cv.id,
      owner: payload.cv.owner,
      skills: payload.cv.skills,
      callbackUrl: CVTECH_CALLBACK_URL,
    };

    try {
      const response = await fetch(SKILLS_VERIFIER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // 202 Accepted = le verifier a bien reçu et va traiter en async
      console.log(`[Webhook] Sent to Skills Verifier for CV #${payload.cv.id} → HTTP ${response.status}`);
    } catch (err) {
      console.error('[Webhook] Failed to reach Skills Verifier:', err);
    }
  }
}
