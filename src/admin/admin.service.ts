import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  Request,
} from '@nestjs/common';
import { Organization } from './entities/organization.admin.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { ConnectionPoolService } from '../db/connection-pool/connection-pool.service';
import { ADMIN_DATA_SOURCE } from './providers/database.providers';
import { OrganizationDto } from './dto/organization.dto';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private orgDeviceRepository: Repository<OrgDevice>;
  private organizationRepository: Repository<Organization>;
  constructor(
    @Inject(ADMIN_DATA_SOURCE)
    private adminDataSource: DataSource,
    private connectionPoolService: ConnectionPoolService,
    @Inject(REQUEST) private request: Request,
  ) {
    this.organizationRepository =
      this.adminDataSource.getRepository(Organization);
  }

  public async getOrganizationName(customerId: string) {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { customerId },
        select: ['orgName'],
      });
      return organization?.orgName;
    } catch (error) {
      // this.logger.error(error);
      throw error;
    }
  }


  async getOktaGroup(customerId: string) {
    const { oktaGroupId } = await this.organizationRepository.findOne({
      where: { customerId },
    });
    return oktaGroupId;
  }

  async getOktaGroupName(customerId: string) {
    const { oktaGroupName } = await this.organizationRepository.findOne({
      where: { customerId },
    });
    return oktaGroupName;
  }

  async createOrganizationAdmin(
    createUserDto: CreateUserDto,
    organization: Organization,
    dataSource: DataSource,
  ): Promise<User> {
    this.logger.log(dataSource);
    try {
      const { email, firstName, lastName, role } = createUserDto;
      const okta = this.okta.setupClient();
      let oktaUser: OktaUser;
      const existedOktaUser = await oktaGetUser(createUserDto.email, okta);
      if (existedOktaUser) {
        oktaUser = existedOktaUser;
      } else {
        const newOktaUser = {
          profile: {
            email: email,
            login: email,
            firstName: firstName,
            lastName: lastName,
            organization: organization.oktaGroupName,
          },
          groupIds: [organization.oktaGroupId],
        };

        oktaUser = await okta.userApi.createUser({ body: newOktaUser });
      }
      const userRepository = dataSource.getRepository(User);
      const existedUser = await userRepository.findOne({ where: { email } });

      if (existedUser) {
        return existedUser;
      } else {
        const newUser = new User();
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.email = email;
        newUser.role = role;
        newUser.oktaId = oktaUser.id;
        newUser.role = 'ADMIN';
        return await userRepository.save(newUser);
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async createOrganization(
    registerOrg: RegisterOrganizationDto,
  ): Promise<Organization> {
    try {
      const { databaseName, oktaGroupName } =
        this.generateDatabaseAndOktaGroupName(registerOrg.customerId);

      //Create Okta Group for tenant
      const okta = this.okta.setupClient();
      const existedOktaGroup = await oktaGetGroup(oktaGroupName, okta);
      let oktaGroup: OktaGroup;
      if (existedOktaGroup) {
        oktaGroup = existedOktaGroup;
      } else {
        const oktaGroupOptions = {
          profile: {
            name: oktaGroupName,
            description: registerOrg.orgName,
          },
        };

        const newOktaGroup = await okta.groupApi.createGroup({
          group: oktaGroupOptions,
        });

        await okta.applicationApi.assignGroupToApplication({
          appId: this.configService.get('OKTA_CLIENTID'),
          groupId: newOktaGroup.id,
        });
        if (!newOktaGroup) {
          throw 'oktaGroup creation error';
        }
        oktaGroup = newOktaGroup;
      }
      const newOrg = new Organization();
      newOrg.orgName = registerOrg.orgName;
      newOrg.customerId = registerOrg.customerId.toLowerCase();
      newOrg.databaseName = databaseName;
      newOrg.oktaGroupId = oktaGroup.id;
      newOrg.oktaGroupName = oktaGroupName;
      const newOgranization = await this.organizationRepository.save(newOrg);
      await this.createOrganizationRepository(newOgranization);
      return newOgranization;
    } catch (e) {
      this.logger.error('Okta error');
      this.logger.error(e);
      throw e;
    }
  }

  public async getOrganization(
    customerId: string,
  ): Promise<Organization> | null {
    try {
      if (customerId == null) {
        return null;
      }
      const organization = await this.organizationRepository.findOne({
        where: { customerId: customerId.toLowerCase() },
      });
      return organization;
    } catch (e) {
      throw e;
    }
  }

  public async createOrganizationRepository(
    organization: Organization,
  ): Promise<DataSource | undefined> {
    try {
      // create a database for org
      const databaseName = organization.databaseName;
      const existingDatabases = await this.adminDataSource.query(
        `SELECT datname FROM pg_database WHERE datname='${databaseName}'`,
      );
      if ((existingDatabases?.length ?? 0) === 0) {
        await this.adminDataSource.query(`DO
        $do$
        BEGIN
          IF EXISTS (
              SELECT FROM pg_catalog.pg_roles
              WHERE  rolname = '${databaseName}') THEN

              RAISE NOTICE 'Role "${databaseName}" already exists. Skipping.';
          ELSE
              CREATE ROLE "${databaseName}" LOGIN;
          END IF;
        END
        $do$;`);
        await this.adminDataSource.query(`CREATE DATABASE ${databaseName}`);
        await this.adminDataSource.query(
          `GRANT ALL PRIVILEGES ON DATABASE ${databaseName} TO ${databaseName};`,
        );
        const newDataSource =
          await this.connectionPoolService.initializeTenantDataSource(
            databaseName,
          );
        this.connectionPoolService.addTenantToConnectionMap(
          organization.customerId,
          newDataSource,
        );
        return newDataSource;
      }
      return;
    } catch (e) {
      throw e;
    }
  }

  private async saveDevice(
    device: CreateDeviceDto,
    dataSource: DataSource,
  ): Promise<Device> {
    try {
      const deviceRepo = dataSource.getRepository(Device);
      const existedDevice = await deviceRepo.findOne({
        where: { deviceSerial: device.deviceSerial, revisionOf: IsNull() },
      });
      if (existedDevice) {
        return existedDevice;
      }
      await deviceRepo
        .createQueryBuilder()
        .insert()
        .into(Device)
        .values(device)
        .orIgnore('deviceSerial')
        .execute();
      const savedDevice = await deviceRepo.findOne({
        where: { deviceSerial: device.deviceSerial, revisionOf: IsNull() },
      });
      savedDevice.policy = new Policy();
      const deviceWithPolicy = await deviceRepo.save(savedDevice);
      const revisionService = new RevisionService(dataSource, device.email);
      await revisionService.createRevision(deviceWithPolicy.id, true);
      return deviceWithPolicy;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }


  async getOrganizationList(): Promise<OrganizationDto[]> {
    //TODO CHECK SUPERUSER
    return await this.organizationRepository.find({
      select: ['orgName', 'customerId'],
    });
  }

  async deleteDevice(deviceSerial: string) {
    try {
      await this.orgDeviceRepository.delete({ deviceSerial });
      return true;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteTenant(customerId: string) {
    customerId = customerId.toLowerCase();
    const dataSource =
      this.connectionPoolService.getTenantDataSource(customerId);
    const errors: string[] = [];
    //delete SSO
    try {
      const idpService = new IdpService(
        dataSource,
        this.okta,
        this.oktaSdkConfig,
        this.request,
      );
      await idpService.deleteIdentityProvider();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error deleting IdentityProvider');
    }

    //delete users
    const usersRepository = dataSource.getRepository(User);
    const users = await usersRepository.find();
    const okta = this.okta.setupClient();
    for (const user of users) {
      try {
        await okta.userApi.deactivateUser({ userId: user.oktaId });
        await okta.userApi.deleteUser({
          userId: user.oktaId,
        });
      } catch (error) {
        errors.push(`User with email ${user.email} was not deleted from Okta`);
      }
    }
    if (errors.length > 0) {
      this.logger.error(errors.join('\r\n'));
      throw new InternalServerErrorException(errors.join('\r\n'));
    }

    // delete group
    const organization = await this.organizationRepository.findOneBy({
      customerId,
    });
    try {
      await okta.groupApi.deleteGroup({
        groupId: organization.oktaGroupId,
      });
    } catch (error) {
      this.logger.error(
        `Error while deleting an Okta Group with id '${organization.oktaGroupId}' and name '${organization.oktaGroupName}'`,
      );
      throw new InternalServerErrorException('Okta Group was not deleted');
    }

    //delete database
    try {
      await dataSource.dropDatabase();
      this.logger.log('Database was dropped successfully');
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error dropping database');
    }

    try {
      await this.orgDeviceRepository.delete({
        organization: organization,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error deleting devices from OrgDevice table',
      );
    }

    try {
      await this.organizationRepository.remove(organization);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error deleting organization from common Organization table',
      );
    }
    return HttpStatus.OK;
  }
}
