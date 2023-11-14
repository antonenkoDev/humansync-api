import { Module } from '@nestjs/common';
import { TenantsService } from './tenants/tenants.service';
import { ConnectionPoolService } from './connection-pool/connection-pool.service';
import { DataSourceService } from './data-source/data-source.service';
import { TenantProvider } from './tenants/tenant.provider';


@Module({
  // imports: [UserModule],
  providers: [
    TenantsService,
    ConnectionPoolService,
    OktaAuthConfig,
    OktaSdkConfig,
    Okta,
    DataSourceService,
    ...DatabaseProviders,
    ...organizationProviders,
    TenantProvider,
  ],
  exports: [
    ConnectionPoolService,
    TenantsService,
    DataSourceService,
    TenantProvider,
  ],
})
export class DbModule {}
