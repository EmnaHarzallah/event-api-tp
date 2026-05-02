import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Cv {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('simple-array')
  skills: string[];

  @Column()
  owner: string;

  constructor(name: string, email: string, skills: string[], owner: string) {
    this.name = name;
    this.email = email;
    this.skills = skills;
    this.owner = owner;
  }
}