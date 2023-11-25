import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Organization } from '../entities/organization.admin.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { IsArray, IsOptional } from 'class-validator';

export class CreateOrganizationDto extends OmitType(Organization, [
  'auth0OrganizationId',
  'databaseName',
  'uuid',
]) {
  @ApiProperty()
  adminUser: CreateUserDto;

  @IsOptional()
  @IsArray()
  allowedAuthTypes: string[];
}
