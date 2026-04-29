import { Controller, Get, Param } from '@nestjs/common';
import { CvHistoryService } from './cv-history.service';
import { CvHistory } from './cv-history.entity';

@Controller('cv-history')
export class CvHistoryController {

  constructor(private readonly cvHistoryService: CvHistoryService) {}

  @Get()
  getAllHistory(): Promise<CvHistory[]> {
    return this.cvHistoryService.getAllHistory();
  }

  @Get(':cvId')
  getHistoryForCv(@Param('cvId') cvId: number): Promise<CvHistory[]> {
    return this.cvHistoryService.getHistoryForCv(cvId);
  }
}