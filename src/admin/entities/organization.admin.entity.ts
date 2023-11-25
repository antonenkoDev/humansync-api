import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsLowercase } from 'class-validator';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true })
  @ApiProperty()
  @IsLowercase()
  @IsAlphanumeric('en-US')
  customerId: string;

  @Column({ unique: true })
  @ApiProperty()
  name: string;

  @Column({ unique: true })
  databaseName: string;

  @Column({ unique: true })
  auth0OrganizationId: string;
}
