import { Inject, Injectable } from '@nestjs/common';
import { Tenant } from './tenant';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../admin/entities/organization.admin.entity';
import { ADMIN_DATA_SOURCE } from '../../admin/providers/database.providers';

@Injectable()
export class TenantsService {
  private organizationRepository: Repository<Organization>;
  constructor(
    @Inject(ADMIN_DATA_SOURCE)
    private adminDataSource: DataSource,
  ) {
    this.organizationRepository =
      this.adminDataSource.getRepository(Organization);
  }

  public async getTenants(): Promise<Array<Tenant>> {
    try {
      const organizations = await this.organizationRepository.find();

      // map to tenants
      // currently an implicit mapping between dbName and the customerId.
      // this mapping should explicitly be defined in a separate function
      const tenants = organizations.map<Tenant>((org) => ({
        orgName: org.orgName,
        orgId: org.customerId,
        dbName: org.databaseName,
      }));
      return tenants;
    } catch (err) {
      throw err;
    }
  }
}
