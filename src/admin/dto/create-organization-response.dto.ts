import { Organization } from '../entities/organization.admin.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class CreateOrganizationResponseDto {
  @ApiProperty()
  organization: Organization;

  @ApiProperty()
  adminUser: User;
}
