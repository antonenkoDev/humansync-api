import { Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConnectionPoolService } from '../connection-pool/connection-pool.service';
import { getOktaGroup } from '../../helpers/get-okta-group';

export const TENANT_DATASOURCE = 'TENANT_DATASOURCE';
const logger = new Logger('TenantProvider');
export const TenantProvider = {
  provide: TENANT_DATASOURCE,

  inject: [REQUEST, ConnectionPoolService],
  useFactory: async (request, connection) => {
    try {
      logger.log('Tenant Provider Initialized');
      const access: string[] = request.user?.access;
      if (access?.includes('migration') || access?.includes('support')) {
        const customerId = request.headers['customer-id'];
        return await connection.getTenantDataSource(customerId);
      }

      const group = getOktaGroup(request.user);
      return await connection.getTenantDataSource(group);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  },
  scope: Scope.REQUEST,
};
