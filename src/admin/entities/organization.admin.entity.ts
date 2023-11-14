import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrgDevice } from './org-device.admin.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true })
  @ApiProperty()
  customerId: string;

  @Column({ unique: true })
  @ApiProperty()
  orgName: string;

  @Column({ unique: true })
  databaseName: string;

  @Column({ unique: true })
  oktaGroupId: string;

  @Column({ unique: true })
  oktaGroupName: string;

  @OneToMany(() => OrgDevice, (orgDevice) => orgDevice.organization)
  orgDevices: OrgDevice[];
}
