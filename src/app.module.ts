import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { CvHistoryService } from './cv-history/cv-history.service';

@Module({
  imports: [CvModule],
  controllers: [AppController],
  providers: [AppService, CvHistoryService],
})
export class AppModule {}
