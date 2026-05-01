export class JoinChatDto {
  userId!: string;
  username!: string;
}

export class SendMessageDto {
  senderId!: string;
  senderName!: string;
  content!: string;
  receiverId?: string;
}

export class ShareCvDto {
  senderId!: string;
  senderName!: string;
  cvId!: number;
  content!: string;
  receiverId?: string;
}

export class RateCvDto {
  cvId!: number;
  reviewerId!: string;
  reviewerName!: string;
  score!: number;
  comment?: string;
}
