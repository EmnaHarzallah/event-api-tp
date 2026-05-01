import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvHistory } from './cv-history.entity';

@Injectable()
export class CvHistoryService {

  constructor(
    @InjectRepository(CvHistory)
    private readonly cvHistoryRepository: Repository<CvHistory>,
  ) {}

  async saveOperation(eventType: string, cvId: number, actor: string, payload: any): Promise<void> {
    const operation = this.cvHistoryRepository.create({
      eventType,
      cvId,
      actor,
      payload,
    });
    await this.cvHistoryRepository.save(operation);
    console.log(`[CvHistoryService] Sauvegardé: ${eventType} | CV: ${cvId}`);
  }

  async getAllHistory(): Promise<CvHistory[]> {
    return this.cvHistoryRepository.find({
      order: { timestamp: 'DESC' },
    });
  }

  async getHistoryForCv(cvId: number): Promise<CvHistory[]> {
    return this.cvHistoryRepository.find({
      where: { cvId },
      order: { timestamp: 'DESC' },
    });
  }
}