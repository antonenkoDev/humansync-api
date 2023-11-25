import { Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantConnectionService } from '../tenant-connection.service';

export const TENANT_DATASOURCE = 'TENANT_DATASOURCE';
const logger = new Logger('TenantProvider');
export const TenantProvider = {
  provide: TENANT_DATASOURCE,

  inject: [REQUEST, TenantConnectionService],
  useFactory: async (request, connection) => {
    try {
      logger.log('Tenant Provider Initialized');
      return await connection.getTenantConnection(request.customerId);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  },
  scope: Scope.REQUEST,
};
