import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TenantProvider } from '../database/providers/tenant.provider';
import { Auth0Service } from '../auth0/auth0.service';

@Module({
  imports: [],
  providers: [UserService, TenantProvider, Auth0Service],
  controllers: [UserController],
})
export class UserModule {}
