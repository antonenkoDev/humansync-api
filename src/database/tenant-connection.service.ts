// tenant-connection.service.ts
import { Injectable, Logger, Scope } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdminDatabaseConfigService } from './admin-database-config.service';
import { Organization } from '../admin/entities/organization.admin.entity';
import { TenantDatabaseConfigService } from './tenant-database-config.service';

@Injectable({ scope: Scope.REQUEST })
export class TenantConnectionService {
  private connectionMap: Map<string, DataSource> = new Map();
  private logger = new Logger(this.constructor.name);
  private organizationRepository: Repository<Organization>;

  constructor(
    // private configService: ConfigService,
    private adminDatabaseConfigService: AdminDatabaseConfigService,
    private tenantDatabaseConfigService: TenantDatabaseConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('module init');
    await this.initOrganizationRepository();
    await this.generateConnections();
  }

  async initOrganizationRepository() {
    let adminDataSource = new DataSource(
      this.adminDatabaseConfigService.createTypeOrmOptions(),
    );
    adminDataSource = await adminDataSource.initialize();
    this.organizationRepository = adminDataSource.getRepository(Organization);
  }

  async getTenants() {
    return this.organizationRepository.find({
      select: ['databaseName', 'customerId'],
    });
  }

  private async generateConnections() {
    const tenants = await this.getTenants();
    for (const tenant of tenants) {
      const newDataSource = await this.initializeTenantDataSource(
        tenant.databaseName,
      );
      this.addTenantToConnectionMap(tenant.customerId, newDataSource);
    }
  }

  // async getTenantConnection(customerId: string): Promise<DataSource> {
  //
  //     const organization = await this.organizationRepository.findOne({
  //       where: {
  //         customerId: customerId,
  //       },
  //       select: ['databaseName'],
  //     });
  //     if (!organization || !organization?.databaseName) {
  //       throw new InternalServerErrorException('No organization found');
  //     }
  //     const dataSource = new DataSource({
  //       type: 'postgres',
  //       // ... other options based on organization
  //       database: organization.databaseName,
  //     });
  //     await dataSource.initialize();
  //     this.connectionMap.set(customerId, dataSource);
  //   }
  //
  //   return this.connectionMap.get(customerId);
  // }

  public async initializeTenantDataSource(
    databaseName: string,
  ): Promise<DataSource> {
    let newDataSource = new DataSource(
      this.tenantDatabaseConfigService.createTypeOrmOptions(databaseName),
    );
    newDataSource = await newDataSource.initialize();
    await newDataSource.runMigrations({ transaction: 'all', fake: false });
    // await newDataSource.undoLastMigration();
    this.addTenantToConnectionMap(databaseName, newDataSource);
    return newDataSource;
  }

  async addTenantToConnectionMap(customerId: string, dataSource: DataSource) {
    this.connectionMap.set(customerId, dataSource);
  }
}
