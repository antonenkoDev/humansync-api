import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseProviders } from './providers/database.providers';
import { organizationProviders } from './providers/organization.providers';
import { DataSourceService } from '../db/data-source/data-source.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Device])],
  controllers: [AdminController],
  providers: [
    AdminService,
    ...DatabaseProviders,
    ...organizationProviders,
    DataSourceService,
  ],
  exports: [...DatabaseProviders, ...organizationProviders, AdminService],
})
export class AdminModule {}
