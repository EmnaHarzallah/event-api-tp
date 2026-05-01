import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class CvHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  eventType!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column()
  actor!: string;

  @Column()
  cvId!: number;

  @Column({ type: 'simple-json', nullable: true })
  payload: any;
}