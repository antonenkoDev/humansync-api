import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  uuid: string;

  @ManyToMany(() => User, (users) => users.tags)
  @JoinTable()
  users: User[];
}
