import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { CvFeedback } from './cv-feedback.entity';
import { CvModule } from 'src/cv/cv.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, CvFeedback]), CvModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
