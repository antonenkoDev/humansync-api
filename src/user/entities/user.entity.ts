import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Team } from '../../team/entities/team.entity';
import { WorkModeEnum } from '../enums/work-mode.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  uuid: string;

  @Column()
  idpId: string;

  @Column()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ type: 'date' })
  birthdate: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  gender: number;

  @ApiProperty()
  @Column({ type: 'date' })
  firstDay: Date;

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  lastDay: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  timezone: string;

  @ApiPropertyOptional()
  @Column({ type: 'integer', nullable: true })
  workMode: WorkModeEnum;

  @Column({ nullable: true })
  @ManyToMany(() => Team, (teams) => teams.users)
  teams: Team[];
}
