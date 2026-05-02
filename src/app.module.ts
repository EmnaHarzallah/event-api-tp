import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { CvHistoryModule } from './cv-history/cv-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvHistory } from './cv-history/cv-history.entity';
import { Message } from './chat/message.entity';
import { CvFeedback } from './chat/cv-feedback.entity';
import { SseModule } from './sse/sse.module';
import { ChatModule } from './chat/chat.module';
import { WebhookModule } from './webhook/webhook.module';
import { Cv } from './cv/entities/cv.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [CvHistory, Message, CvFeedback, Cv],
      synchronize: true,
      autoLoadEntities: true,
    }),
    CvModule,
    CvHistoryModule,
    SseModule,
    ChatModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}