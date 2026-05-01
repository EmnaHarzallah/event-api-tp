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
  content!: string;// par exemple: "j'aimerais bien que tu révise mon cv"
  receiverId?: string;
}

export class RateCvDto {
  cvId!: number;//l'id du cv qui sera noté
  reviewerId!: string;//celui qui note ( = receiver si la première personne envoie le cv à un user precis, sinon c l'un des deux utilisateurs du grp )
  reviewerName!: string;//le nom de celui qui note
  score!: number;//note donnée entre 1 et 5
  comment?: string;//commentaire donné facultatif accompagné de la note
}
