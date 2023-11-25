import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  // imports: [DbModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
