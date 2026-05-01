import {
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvEventPayload } from 'src/events/cv-event.payload';
import { APP_EVENTS, CvEventType } from 'src/config/event.config';

@Injectable()
export class CvService {

  private cvs: Cv[] = [];

  constructor(
    private eventEmitter: EventEmitter2
  ) {}

  // FACTORIZED EMITTER (central point)
  private emitCvEvent(
    event: CvEventType,
    cv: Cv,
    actor: string
  ) {
    const payload: CvEventPayload = {
      cv,
      actor,
      date: new Date(),
    };

    this.eventEmitter.emit(event, payload);
  }

  // CREATE
  create(data: CreateCvDto, owner: string) {
    const cv = new Cv(
      Date.now(),
      data.name,
      data.email,
      data.skills,
      owner
    );

    this.cvs.push(cv);

    this.emitCvEvent(APP_EVENTS.CvCreated, cv, owner);

    return cv;
  }

  // READ ALL
  findAll() {
    return this.cvs;
  }

  // READ ONE
  findOne(id: number) {
    return this.cvs.find(c => c.id === +id);
  }

  // UPDATE
  update(id: number, data: UpdateCvDto, actor: string) {
    const cv = this.findOne(+id);

    if (!cv) throw new NotFoundException();

    Object.assign(cv, data);

    this.emitCvEvent(APP_EVENTS.CvUpdated, cv, actor);

    return cv;
  }

  // DELETE
  remove(id: number, actor: string) {
    const cv = this.findOne(+id);

    if (!cv) throw new NotFoundException();

    this.emitCvEvent(APP_EVENTS.CvDeleted, cv, actor);

    this.cvs = this.cvs.filter(c => c.id !== +id);

    return cv;
  }
}