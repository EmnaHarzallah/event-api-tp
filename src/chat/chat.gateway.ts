import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CvService } from 'src/cv/cv.service';
import { JoinChatDto, SendMessageDto, ShareCvDto, RateCvDto } from './chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly cvService: CvService,
  ) { }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  handleConnection(client: Socket) {
    console.log(`[WS] connected:    ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.chatService.removeUser(client.id);
    if (user) {//succès de la suppression de l'utilisateur du chat, on diffuse à tout le monde connecté dans ce chat la mise à jour de la liste des utilisateurs
      this.server.emit('usersOnline', {
        users: this.chatService.getOnlineUsers(),
      });
      console.log(`[WS] disconnected: ${client.id} (${user.username})`);
    }
  }

  // Émet une erreur au client sans utiliser le nom 'error' (réservé par Socket.IO)
  private sendError(client: Socket, message: string) {
    client.emit('chatError', { message });
  }

  // ─── joinChat ──────────────────────────────────────────────────────────────
  // Client   : socket.emit('joinChat', { userId: 'u1', username: 'Alice' })
  // Broadcast: 'joinedChat'  → { userId, username }
  // Broadcast: 'usersOnline' → { users }
  // To caller: 'chatHistory' → Message[]
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatDto,
  ): Promise<void> {
    this.chatService.addUser(client.id, data.userId, data.username);

    this.server.emit('joinedChat', {
      userId: data.userId,
      username: data.username,
    });

    this.server.emit('usersOnline', {
      users: this.chatService.getOnlineUsers(),
    });

    try {
      const history = await this.chatService.getMessagesForUser(data.userId);
      client.emit('chatHistory', history);// envoie l'historique des messages au client qui vient de se connecter
    } catch (err) {
      console.error('[WS] chatHistory error:', err);
      client.emit('chatHistory', []);
    }
  }

  // ─── sendMessage ───────────────────────────────────────────────────────────
  // Client   : socket.emit('sendMessage', { senderId, senderName, content, receiverId? })
  // Si receiverId absent → 'newMessage' à tout le monde
  // Si receiverId présent → 'newMessage' au destinataire + à l'expéditeur
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ): Promise<void> {
    try {
      const message = await this.chatService.saveTextMessage(data);

      if (data.receiverId) {
        const targetSocket = this.chatService.getSocketId(data.receiverId);
        if (!targetSocket) {
          this.sendError(client, `User "${data.receiverId}" is not connected`);
          return;
        }
        this.server.to(targetSocket).emit('newMessage', message);
        client.emit('messageSent', message);// pour confirmer à l'utilisateur que le message a été envoyé
      } else {
        client.broadcast.emit('newMessage', message);//diffusion à tout le monde sauf à l'expéditeur
        client.emit('messageSentToAll', message);// pour confirmer à l'utilisateur que le message a été envoyé
      }
    } catch (err) {
      console.error('[WS] sendMessage error:', err);
      this.sendError(client, 'Failed to save message');
    }
  }

  // ─── shareCv ───────────────────────────────────────────────────────────────
  // Client   : socket.emit('shareCv', { senderId, senderName, cvId, content, receiverId? })
  // Si receiverId absent → 'cvShared' à tout le monde
  // Si receiverId présent → 'cvShared' au destinataire + à l'expéditeur
  @SubscribeMessage('shareCv')
  async handleShareCv(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ShareCvDto,
  ): Promise<void> {
    try {
      const cv = this.cvService.findOne(data.cvId);
      if (!cv) {
        this.sendError(client, `CV ${data.cvId} not found`);
        return;
      }
      //transformer le dto du cv partagé en message pour l'enregistrer dans la base de données
      const message = await this.chatService.saveCvShareMessage(data);

      const payload = {
        message,
        cv,
        senderId: data.senderId,
        senderName: data.senderName,
        receiverId: data.receiverId,
      };

      if (data.receiverId) {
        const targetSocket = this.chatService.getSocketId(data.receiverId);
        if (!targetSocket) {
          this.sendError(client, `User "${data.receiverId}" is not connected`);
          return;
        }
        this.server.to(targetSocket).emit('cvShared', payload);
        client.emit('cvSent', payload);
      } else {
        client.broadcast.emit('cvShared', payload);
        this.server.emit('cvSharedToAll', payload);
      }
    } catch (err) {
      console.error('[WS] shareCv error:', err);
      this.sendError(client, 'Failed to share CV');
    }
  }

  // ─── rateCv ────────────────────────────────────────────────────────────────
  // Client   : socket.emit('rateCv', { cvId, reviewerId, reviewerName, score, comment? })
  // Broadcast: 'cvRated' → { cvId, reviewerName, score, comment?, averageScore, totalReviews }
  @SubscribeMessage('rateCv')
  async handleRateCv(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RateCvDto,
  ): Promise<void> {
    if (data.score < 0 || data.score > 10) {
      this.sendError(client, 'Score must be between 0 and 10');
      return;
    }

    try {
      const result = await this.chatService.rateCv(data);//ajouter ou mettre à jour la note donnée par le reviewer pour le cv

      client.broadcast.emit('cvRated', {
        cvId: data.cvId,
        reviewerId: data.reviewerId,
        reviewerName: data.reviewerName,
        score: data.score,
        comment: data.comment,
        averageScore: result.averageScore,
        totalReviews: result.totalReviews,
      });
      client.emit('cvRatedAck', {
        cvId: data.cvId,
        averageScore: result.averageScore,
        totalReviews: result.totalReviews,
        status: 'SUCCESS'
      });
    } catch (err) {
      console.error('[WS] rateCv error:', err);
      this.sendError(client, 'Failed to save rating');
    }
  }
}
