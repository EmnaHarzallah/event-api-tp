import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService, MessageEvent } from './sse.service';
import { GetUser } from '../common/decorators/user.decorator';
import type { AuthenticatedUser } from '../common/decorators/user.decorator';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('events')
  sendEvents(@GetUser() user: AuthenticatedUser): Observable<MessageEvent> {
    // Controller is now extremely thin and delegates the stream creation to the Service
    return this.sseService.subscribeToCvEvents(user);
  }
}
