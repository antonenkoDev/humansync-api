import { Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrganizationDto {
  @ApiProperty()
  @Matches('^[a-zA-Z0-9_]*$')
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsNotEmpty()
  orgName: string;
}
