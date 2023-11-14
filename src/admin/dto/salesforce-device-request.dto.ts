import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
export class SalesforceDeviceRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  deviceSerial: string;

  @IsNotEmpty()
  @ApiProperty()
  @Matches(/^[a-z0-9_]+$/i)
  sfdcAccountId: string;

  @IsNotEmpty()
  @ApiProperty()
  companyName: string;

  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  expirationDate: Date;

  @IsNotEmpty()
  @ApiProperty()
  model: string;

  @IsNotEmpty()
  @ApiProperty()
  purchasedDate: Date;
}
