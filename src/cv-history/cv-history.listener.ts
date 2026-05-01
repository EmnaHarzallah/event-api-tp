import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_EVENTS } from '../config/event.config';
import { CvHistoryService } from './cv-history.service';
import type { CvEventPayload } from '../events/cv-event.payload';

@Injectable()
export class CvHistoryListener {

  constructor(private readonly cvHistoryService: CvHistoryService) {}

  @OnEvent(APP_EVENTS.CvCreated)
  async handleCvCreated(payload: CvEventPayload): Promise<void> {
    await this.cvHistoryService.saveOperation(
      APP_EVENTS.CvCreated,
      payload.cv.id,
      payload.actor,
      payload,
    );
  }

  @OnEvent(APP_EVENTS.CvUpdated)
  async handleCvUpdated(payload: CvEventPayload): Promise<void> {
    await this.cvHistoryService.saveOperation(
      APP_EVENTS.CvUpdated,
      payload.cv.id,
      payload.actor,
      payload,
    );
  }

  @OnEvent(APP_EVENTS.CvDeleted)
  async handleCvDeleted(payload: CvEventPayload): Promise<void> {
    await this.cvHistoryService.saveOperation(
      APP_EVENTS.CvDeleted,
      payload.cv.id,
      payload.actor,
      payload,
    );
  }
}