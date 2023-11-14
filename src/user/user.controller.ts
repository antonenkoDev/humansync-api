import { Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(userService: UserService) {}

  @Post('/')
  async createUser() {
    return userService.create();
  }
}
