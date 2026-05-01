import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from './message.entity';
import { CvFeedback } from './cv-feedback.entity';
import { SendMessageDto, ShareCvDto, RateCvDto } from './chat.dto';

interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
}

@Injectable()
export class ChatService {
  // socketId -> user (in-memory, réinitialisé au redémarrage)
  private connectedUsers = new Map<string, ConnectedUser>();
  // userId -> socketId (index inverse pour l'envoi ciblé)
  private userToSocket = new Map<string, string>();

  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(CvFeedback)
    private feedbackRepo: Repository<CvFeedback>,
  ) {}

  // ─── Gestion des connexions ────────────────────────────────────────────────

  addUser(socketId: string, userId: string, username: string): void {
    const user: ConnectedUser = { userId, username, socketId };
    this.connectedUsers.set(socketId, user);
    this.userToSocket.set(userId, socketId);
  }

  removeUser(socketId: string): ConnectedUser | undefined {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      this.userToSocket.delete(user.userId);
    }
    return user;
  }

  getOnlineUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getSocketId(userId: string): string | undefined {
    return this.userToSocket.get(userId);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  async saveTextMessage(dto: SendMessageDto): Promise<Message> {
    const msg = this.messageRepo.create({
      senderId: dto.senderId,
      senderName: dto.senderName,
      content: dto.content,
      type: MessageType.TEXT,
      receiverId: dto.receiverId,
    });
    return this.messageRepo.save(msg);
  }

  async saveCvShareMessage(dto: ShareCvDto): Promise<Message> {
    const msg = this.messageRepo.create({
      senderId: dto.senderId,
      senderName: dto.senderName,
      content: dto.content,
      type: MessageType.CV_SHARE,
      cvId: dto.cvId,
      receiverId: dto.receiverId,
    });
    return this.messageRepo.save(msg);
  }

  // Retourne : messages publics + messages privés impliquant cet utilisateur
  async getMessagesForUser(userId: string): Promise<Message[]> {
    return this.messageRepo
      .createQueryBuilder('m')
      .where('m.receiverId IS NULL')
      .orWhere('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .orderBy('m.createdAt', 'ASC')
      .getMany();
  }

  // ─── Feedbacks CV ─────────────────────────────────────────────────────────

  async rateCv(
    dto: RateCvDto,
  ): Promise<{ feedback: CvFeedback; averageScore: number; totalReviews: number }> {
    // Une note par utilisateur par CV — mise à jour si elle existe déjà
    let feedback = await this.feedbackRepo.findOne({
      where: { cvId: dto.cvId, reviewerId: dto.reviewerId },
    });

    if (feedback) {
      feedback.score = dto.score;
      feedback.comment = dto.comment;
    } else {
      feedback = this.feedbackRepo.create({
        cvId: dto.cvId,
        reviewerId: dto.reviewerId,
        reviewerName: dto.reviewerName,
        score: dto.score,
        comment: dto.comment,
      });
    }

    await this.feedbackRepo.save(feedback);

    const averageScore = await this.getAverageScore(dto.cvId);
    const totalReviews = await this.feedbackRepo.count({
      where: { cvId: dto.cvId },
    });

    return { feedback, averageScore, totalReviews };
  }

  async getFeedbacksForCv(cvId: number): Promise<CvFeedback[]> {
    return this.feedbackRepo.find({
      where: { cvId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageScore(cvId: number): Promise<number> {
    const feedbacks = await this.feedbackRepo.find({ where: { cvId } });
    if (feedbacks.length === 0) return 0;
    const avg =
      feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
    return Math.round(avg * 10) / 10;
  }
}
