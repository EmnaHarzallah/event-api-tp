import { Cv } from '../cv/entities/cv.entity';

export interface CvEventPayload {
  cv: Cv;
  date: Date;
  user?: string; // Optional because only 'cv.created' includes the 'user' field directly
}
