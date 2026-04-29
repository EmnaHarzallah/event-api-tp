import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { CvHistoryModule } from './cv-history/cv-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvHistory } from './cv-history/cv-history.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [CvHistory],
      synchronize: true,
    }),
    CvModule,
    CvHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}