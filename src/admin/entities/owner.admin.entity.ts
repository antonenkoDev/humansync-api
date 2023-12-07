import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from './organization.admin.entity';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  auth0Id: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  firstName: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  lastName: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  timezone?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  phone: string;

  @ManyToMany(() => Organization, (organization) => organization.owner)
  organizations: Organization[];
}
