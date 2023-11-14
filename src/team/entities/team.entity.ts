import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  uuid: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.teams)
  users: User[];
}
