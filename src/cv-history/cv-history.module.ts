import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvHistory } from './cv-history.entity';
import { CvHistoryService } from './cv-history.service';
import { CvHistoryListener } from './cv-history.listener';
import { CvHistoryController } from './cv-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CvHistory])],
  providers: [CvHistoryService, CvHistoryListener],
  controllers: [CvHistoryController],
  exports: [CvHistoryService],
})
export class CvHistoryModule {}