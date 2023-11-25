// database.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantConnectionService } from './tenant-connection.service';
import { AdminService } from '../admin/admin.service';
import { AdminDatabaseProvider } from '../admin/providers/database.providers';
import { Auth0Service } from '../auth0/auth0.service';
import { AdminDatabaseConfigService } from './admin-database-config.service';
import { TenantDatabaseConfigService } from './tenant-database-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AdminService,
    TenantConnectionService,
    ...AdminDatabaseProvider,
    Auth0Service,
    AdminDatabaseConfigService,
    TenantDatabaseConfigService,
  ],
  exports: [
    TenantConnectionService,
    AdminDatabaseConfigService,
    TenantDatabaseConfigService,
  ],
})
export class DatabaseModule {}
