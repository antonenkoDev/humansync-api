import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Team } from '../../team/entities/team.entity';
import { WorkModeEnum } from '../enums/work-mode.enum';
import { Tag } from '../../tag/entities/tag.entity';

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

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  birthdate?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  gender: number;

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  firstDay?: Date;

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  lastDay?: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  @ManyToMany(() => Tag, (tags) => tags.users)
  tags?: Tag[];

  @ApiPropertyOptional()
  @Column({ type: 'integer', nullable: true })
  workMode?: WorkModeEnum;

  @Column({ nullable: true })
  @ManyToMany(() => Team, (teams) => teams.users)
  teams?: Team[];
}
