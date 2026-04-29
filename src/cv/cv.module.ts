import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvGateway } from './cv.gateway';

@Module({
  providers: [CvGateway, CvService],
})
export class CvModule {}
