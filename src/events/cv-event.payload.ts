import { Cv } from '../cv/entities/cv.entity';

// cv-event.payload.ts
export interface CvEventPayload {
  cv: Cv;
  actor: string;
  date: Date;
}