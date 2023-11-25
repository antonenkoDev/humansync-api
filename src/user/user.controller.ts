import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly userService: UserService) {
    this.logger.log('USER CONTROLLER initialized');
  }

  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
