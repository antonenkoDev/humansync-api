import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable()
  users: User[];
}
