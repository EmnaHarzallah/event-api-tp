import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_EVENTS } from '../config/event.config';
import { CvHistoryService } from './cv-history.service';

@Injectable()
export class CvHistoryListener {

  constructor(private readonly cvHistoryService: CvHistoryService) {}

  @OnEvent(APP_EVENTS.CvCreated)
  async handleCvCreated(payload: any): Promise<void> {
    await this.cvHistoryService.saveOperation(
      APP_EVENTS.CvCreated,
      payload.cv.id,
      payload.user,
      payload,
    );
  }

  @OnEvent(APP_EVENTS.CvUpdated)
  async handleCvUpdated(payload: any): Promise<void> {
    await this.cvHistoryService.saveOperation(
      APP_EVENTS.CvUpdated,
      payload.cv.id,
      payload.cv.owner,
      payload,
    );
  }

 @OnEvent(APP_EVENTS.CvDeleted)
async handleCvDeleted(payload: any): Promise<void> {
  await this.cvHistoryService.saveOperation(
    APP_EVENTS.CvDeleted,
    payload.cv?.id ?? payload.cvId,
    payload.cv?.owner ?? payload.owner ?? 'unknown',
    payload,
  );
}
}