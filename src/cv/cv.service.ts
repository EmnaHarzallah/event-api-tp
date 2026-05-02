import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvEventPayload } from 'src/events/cv-event.payload';
import { APP_EVENTS, CvEventType } from 'src/config/event.config';

@Injectable()
export class CvService {

  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
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
  async create(data: CreateCvDto, owner: string) {
    const cv = new Cv(
      data.name,
      data.email,
      data.skills,
      owner
    );

    const savedCv = await this.cvRepository.save(cv);

    this.emitCvEvent(APP_EVENTS.CvCreated, savedCv, owner);

    return savedCv;
  }

  // READ ALL
  async findAll() {
    return await this.cvRepository.find();
  }

  // READ ONE
  async findOne(id: number) {
    const cv = await this.cvRepository.findOne({ where: { id: +id } });
    return cv;
  }

  // UPDATE
  async update(id: number, data: UpdateCvDto, actor: string) {
    const cv = await this.findOne(+id);

    if (!cv) throw new NotFoundException();

    Object.assign(cv, data);
    const updatedCv = await this.cvRepository.save(cv);

    this.emitCvEvent(APP_EVENTS.CvUpdated, updatedCv, actor);

    return updatedCv;
  }

  // DELETE
  async remove(id: number, actor: string) {
    const cv = await this.findOne(+id);

    if (!cv) throw new NotFoundException();

    this.emitCvEvent(APP_EVENTS.CvDeleted, cv, actor);

    await this.cvRepository.remove(cv);

    return cv;
  }
}