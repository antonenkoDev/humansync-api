// database.providers.ts
import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminDatabaseConfigService } from '../../database/admin-database-config.service';

export const ADMIN_DATA_SOURCE = 'ADMIN_DATA_SOURCE';

export const AdminDatabaseProvider: Provider[] = [
  {
    provide: ADMIN_DATA_SOURCE,
    useFactory: async (
      adminDatabaseConfigService: AdminDatabaseConfigService,
    ): Promise<DataSource> => {
      const adminDataSource = new DataSource(
        adminDatabaseConfigService.createTypeOrmOptions(),
      );
      return adminDataSource.initialize();
    },
    inject: [AdminDatabaseConfigService],
  },
];
