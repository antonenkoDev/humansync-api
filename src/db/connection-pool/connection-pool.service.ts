import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { TenantsService } from '../tenants/tenants.service';
import { DataSource } from 'typeorm';
import { DataSourceService } from '../data-source/data-source.service';

@Injectable()
export class ConnectionPoolService implements OnModuleInit {
  private connections: Map<string, DataSource> = new Map<string, DataSource>();
  private readonly logger = new Logger(ConnectionPoolService.name);

  constructor(
    private tenantService: TenantsService,
    private primaryDataSourceService: DataSourceService,
  ) {}

  async onModuleInit() {
    this.logger.log('module init');
    await this.generateConnections();
  }

  private async generateConnections() {
    const tenants = await this.tenantService.getTenants();
    for (const tenant of tenants) {
      const newDataSource = await this.initializeTenantDataSource(
        tenant.dbName,
      );
      this.addTenantToConnectionMap(tenant.orgId, newDataSource);
    }
  }

  public getTenantDataSource(tenantId: string): DataSource {
    try {
      const dataSource = this.connections.get(tenantId);
      if (dataSource === undefined) {
        throw new BadRequestException(
          'Could not Find Organization Data Source',
        );
      }
      return dataSource;
    } catch (err) {
      this.logger.log(err);
      throw err;
    }
  }

  public async initializeTenantDataSource(
    dataSourceDb: string,
  ): Promise<DataSource> {
    try {
      let newDataSource = new DataSource(
        this.primaryDataSourceService.createDatasourceOptions(dataSourceDb),
      );
      newDataSource = await newDataSource.initialize();
      await newDataSource.runMigrations({ transaction: 'all', fake: false });
      // await newDataSource.undoLastMigration();
      this.addTenantToConnectionMap(dataSourceDb, newDataSource);
      return newDataSource;
    } catch (err) {
      // log here that this database could not initialize
      this.logger.error(err);
    }
  }

  public addTenantToConnectionMap(
    orgId: string,
    dataSource: DataSource,
  ): Map<string, DataSource> {
    this.connections.set(orgId, dataSource);
    return this.connections;
  }
}
