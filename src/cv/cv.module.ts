import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
//import { CvGateway } from './cv.gateway'; 
import { CvController } from './cv.controller';


@Module({
  providers: [//CvGateway, 
    CvService],
  controllers: [CvController],
  exports: [CvService],
})
export class CvModule {}