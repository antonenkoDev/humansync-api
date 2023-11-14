import { Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConnectionPoolService } from '../connection-pool/connection-pool.service';

export const TENANT_DATASOURCE = 'TENANT_DATASOURCE';
const logger = new Logger('TenantProvider');
export const TenantProvider = {
  provide: TENANT_DATASOURCE,

  inject: [REQUEST, ConnectionPoolService],
  useFactory: async (request, connection) => {

  },
  scope: Scope.REQUEST,
};
