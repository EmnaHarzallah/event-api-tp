import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class CvFeedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cvId!: number;

  @Column()
  reviewerId!: string;

  @Column()
  reviewerName!: string;

  @Column('float')
  score!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
