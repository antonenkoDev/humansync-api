import { Module } from '@nestjs/common';
import { TenantsService } from './tenants/tenants.service';
import { ConnectionPoolService } from './connection-pool/connection-pool.service';
import { PrimaryDataSourceService } from './primary-data-source/primary-data-source.service';
import { TenantProvider } from './tenants/tenant.provider';


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
