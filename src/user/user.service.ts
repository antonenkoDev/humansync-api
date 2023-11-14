import { Inject, Injectable } from '@nestjs/common';
import { TENANT_DATASOURCE } from '../db/tenants/tenant.provider';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  userRepository: Repository<User>;

  constructor(
    @Inject(TENANT_DATASOURCE)
    private dataSource,
  ) {
    this.userRepository = dataSource.getRepository(User);
  }

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto);
  }
}
