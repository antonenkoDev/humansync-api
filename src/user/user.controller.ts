import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly userService: UserService) {
    this.logger.log('USER CONTROLLER initialized');
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get Users by id',
    type: User,
  })
  async getUserById(@Param('id') userid: string) {
    return this.userService.findById(userid);
  }

  @Get('/')
  @ApiOkResponse({
    description: 'Get list of Users',
    type: User,
    isArray: true,
  })
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Post('/')
  @ApiOkResponse({ description: 'Create User', type: User })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
