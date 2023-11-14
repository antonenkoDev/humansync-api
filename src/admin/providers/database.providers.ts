import { createAdminDataSource } from '../../../db/admin-data-source';

export const ADMIN_DATA_SOURCE = 'ADMIN_DATA_SOURCE';

export const DatabaseProviders = [
  {
    provide: ADMIN_DATA_SOURCE,
    useFactory: () => {
      return createAdminDataSource().initialize();
    },
  },
];
