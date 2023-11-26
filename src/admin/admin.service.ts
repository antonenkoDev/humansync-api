import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Organization } from './entities/organization.admin.entity';
import { DataSource, Repository } from 'typeorm';
import { ADMIN_DATA_SOURCE } from './providers/database.providers';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Auth0Service } from '../auth0/auth0.service';
import { CreateAuth0OrganizationInterface } from './interfaces/create-auth0-organization.interface';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { UserService } from '../user/user.service';
import { REQUEST } from '@nestjs/core';
import { HsRequest } from '../interfaces/hs-request.interface';
import { CreateOrganizationResponseDto } from './dto/create-organization-response.dto';
import { ConfigService } from '@nestjs/config';
import { CreateOrganizationDatabaseUserQuery } from './helpers/create-organization-database-user-query';

@Injectable({ scope: Scope.REQUEST })
export class AdminService {
  private readonly logger = new Logger(this.constructor.name);
  private organizationRepository: Repository<Organization>;

  constructor(
    @Inject(ADMIN_DATA_SOURCE)
    private adminDataSource: DataSource,
    private tenantConnectionService: TenantConnectionService,
    @Inject(REQUEST) private request: HsRequest,
    private auth0Service: Auth0Service,
    private configService: ConfigService,
  ) {
    this.logger.log('ADMIN SERVICE initialized');

    this.organizationRepository =
      this.adminDataSource.getRepository(Organization);
  }

  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<CreateOrganizationResponseDto> {
    const auth0OrganizationId = await this.createAuth0Organization({
      name: createOrganizationDto.customerId.toLowerCase(),
      displayName: createOrganizationDto.name,
      connections: createOrganizationDto.allowedAuthTypes,
    });
    const newDataSource = await this.createOrganizationDatabase(
      createOrganizationDto.customerId,
    );

    const adminUser = createOrganizationDto.adminUser;
    const userService = new UserService(
      newDataSource,
      this.auth0Service,
      this.request,
      this.configService,
    );
    const addedAdminUser = await userService.create(adminUser, {
      auth0OrganizationId,
    });

    const organization = this.organizationRepository.create();
    organization.auth0OrganizationId = auth0OrganizationId;
    organization.customerId = createOrganizationDto.customerId;
    organization.name = createOrganizationDto.name;
    organization.databaseName = this.generateDatabaseName(
      createOrganizationDto.customerId,
    );

    return {
      organization: await this.organizationRepository.save(organization),
      adminUser: addedAdminUser,
    };
  }

  generateDatabaseName(customerId: string) {
    return `org_${customerId}`;
  }

  async createOrganizationDatabase(customerId: string) {
    //Promise<DataSource>
    const databaseName = this.generateDatabaseName(customerId);
    const existingDatabases = await this.adminDataSource.query(
      `SELECT datname FROM pg_database WHERE datname='${databaseName}'`,
    );
    if ((existingDatabases?.length ?? 0) === 0) {
      await this.adminDataSource.query(
        CreateOrganizationDatabaseUserQuery(databaseName),
      );
      await this.adminDataSource.query(`CREATE DATABASE ${databaseName}`);
      await this.adminDataSource.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${databaseName} TO ${databaseName};`,
      );
    }
    const newDataSource =
      await this.tenantConnectionService.initializeTenantDataSource(
        databaseName,
      );

    // Теперь добавляем новый DataSource в карту соединений
    await this.tenantConnectionService.addTenantToConnectionMap(
      customerId,
      newDataSource,
    );

    return newDataSource;
  }

  async createAuth0Organization(
    auth0Organization: CreateAuth0OrganizationInterface,
  ): Promise<string> {
    const connections = auth0Organization.connections ?? [];
    connections.push(this.configService.get<string>('AUTH0_CONNECTION_ID'));
    return await this.auth0Service.createOrganization({
      name: auth0Organization.name,
      display_name: auth0Organization.displayName,
      enabled_connections: connections.map((connection) => {
        return {
          connection_id: connection,
          assign_membership_on_login: true,
        };
      }),
    });
  }

  public async getOrganization(
    customerId: string,
  ): Promise<Organization> | null {
    return await this.organizationRepository.findOne({
      where: { customerId: customerId.toLowerCase() },
    });
  }

  async getOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }
}
