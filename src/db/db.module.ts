import { Module } from '@nestjs/common';
import { TenantsService } from './tenants/tenants.service';
import { ConnectionPoolService } from './connection-pool/connection-pool.service';
import { PrimaryDataSourceService } from './primary-data-source/primary-data-source.service';
import { organizationProviders } from '../admin/providers/organization.providers';
import { DatabaseProviders } from '../admin/providers/database.providers';
import { TenantProvider } from './tenants/tenant.provider';
import { Okta } from '../auth/okta.setup';
import { OktaSdkConfig } from '../config/okta.sdk.config';
import { OktaAuthConfig } from '../config/auth.config';

@Module({
  // imports: [UserModule],
  providers: [
    TenantsService,
    ConnectionPoolService,
    OktaAuthConfig,
    OktaSdkConfig,
    Okta,
    PrimaryDataSourceService,
    ...DatabaseProviders,
    ...organizationProviders,
    TenantProvider,
  ],
  exports: [
    ConnectionPoolService,
    TenantsService,
    PrimaryDataSourceService,
    TenantProvider,
  ],
})
export class DbModule {}
