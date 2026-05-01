import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, merge } from 'rxjs';
import { map, filter, startWith } from 'rxjs/operators';
import { AuthenticatedUser } from '../common/decorators/user.decorator';
import { CvEventPayload } from '../events/cv-event.payload';
import { APP_EVENTS } from '../config/event.config';

// Interface defining the expected message event structure for SSE
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class SseService {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  subscribeToCvEvents(user: AuthenticatedUser): Observable<MessageEvent> {
    const isAdmin = user.role === 'admin';

    // 1. Create streams for each event type (strongly typed)
    const created$ = fromEvent<CvEventPayload>(this.eventEmitter, APP_EVENTS.CvCreated).pipe(
      map(payload => ({ type: APP_EVENTS.CvCreated, payload }))
    );
    const updated$ = fromEvent<CvEventPayload>(this.eventEmitter, APP_EVENTS.CvUpdated).pipe(
      map(payload => ({ type: APP_EVENTS.CvUpdated, payload }))
    );
    const deleted$ = fromEvent<CvEventPayload>(this.eventEmitter, APP_EVENTS.CvDeleted).pipe(
      map(payload => ({ type: APP_EVENTS.CvDeleted, payload }))
    );

    // 2. Merge them into a single observable stream
    const allEvents$ = merge(created$, updated$, deleted$, skillsVerified$);

    // 3. Apply filters and format the output stream
    return allEvents$.pipe(
      // Filter: Admin sees everything, normal user sees only their own CVs
      filter(event => isAdmin || event.owner === user.id),
      // Map the payload to the expected SSE MessageEvent format
      map(event => ({
        data: {
          type: event.type,
          ...event.payload,
        },
      })),
      // Instantly send a welcome message when a client subscribes
      startWith({
        data: {
          type: 'connected',
          message: 'Connected to CV events stream',
          user: user.id,
          isAdmin,
        },
      } as MessageEvent)
    );
  }
}
