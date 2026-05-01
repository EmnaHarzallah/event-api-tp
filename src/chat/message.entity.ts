import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum MessageType {
  TEXT = 'TEXT',
  CV_SHARE = 'CV_SHARE',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  senderId!: string;

  @Column()
  senderName!: string;

  @Column('text')
  content!: string;

  @Column({ type: 'text', default: MessageType.TEXT })
  type!: MessageType;

  @Column({ nullable: true })
  cvId?: number;

  @Column({ nullable: true })
  receiverId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
