// admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { organizationProviders } from './providers/organization.providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDatabaseProvider } from './providers/database.providers';
import { Auth0Service } from '../auth0/auth0.service';
import { AdminDatabaseConfigService } from 'src/database/admin-database-config.service';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { DatabaseModule } from '../database/database.module';
import { TenantIdentificationMiddleware } from '../middlewares/tenant-identification.middleware';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: AdminDatabaseConfigService,
    }),
    DatabaseModule,
  ],
  controllers: [AdminController],
  providers: [
    TenantConnectionService,
    Auth0Service,
    AdminService,
    ...AdminDatabaseProvider,
    ...organizationProviders,
    TenantIdentificationMiddleware,
  ],
  exports: [...organizationProviders, AdminService, ...AdminDatabaseProvider],
})
export class AdminModule {}
