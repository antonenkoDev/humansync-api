import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto extends OmitType(User, [
  'uuid',
  'idpId',
  'lastDay',
  'firstDay',
  'teams',
]) {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
