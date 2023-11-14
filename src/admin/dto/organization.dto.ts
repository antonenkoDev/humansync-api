import { ApiProperty } from '@nestjs/swagger';
export class OrganizationDto {
  @ApiProperty()
  orgName: string;

  @ApiProperty()
  customerId: string;
}
