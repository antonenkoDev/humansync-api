import { DataSource } from 'typeorm';
import { Organization } from '../entities/organization.admin.entity';
import { ADMIN_DATA_SOURCE } from './database.providers';

export const ORGANIZATION_REPOSITORY = 'ORGANIZATION_REPOSITORY';

export const organizationProviders = [
  {
    provide: ORGANIZATION_REPOSITORY,
    useFactory: async (dataSource: DataSource) =>
      dataSource.getRepository(Organization),
    inject: [ADMIN_DATA_SOURCE],
  },
];
