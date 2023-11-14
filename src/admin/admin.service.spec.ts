import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { OrgDevice } from './entities/org-device.admin.entity';
import { ConnectionPoolService } from '../db/connection-pool/connection-pool.service';
import { Okta } from '../auth/okta.setup';
import { TenantsService } from '../db/tenants/tenants.service';
import { PrimaryDataSourceService } from '../db/data-source/data-source.service';
import { OktaSdkConfig } from '../config/okta.sdk.config';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Organization } from './entities/organization.admin.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { ADMIN_DATA_SOURCE } from './providers/database.providers';
import { Policy } from '../device/entities/device/policy/policy.entity';
import { Device } from '../device/entities/device/device.entity';
import * as getOktaUserModule from './helpers/get-okta-user';
import { SalesforceDeviceRequestDto } from './dto/salesforce-device-request.dto';
import { HttpStatus } from '@nestjs/common';
import { IdpService } from '../idp/idp.service';
import { SsoSettings } from '../idp/entities/sso-settings.entity';

const oktaGetGroup = jest.fn() as jest.Mock;
const oktaGetUser = jest.fn() as jest.Mock;
const mockOrganizationRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};
const mockOktaClient = {
  http: { http: jest.fn() },
  createGroup: jest.fn(),
  createUser: jest.fn(),
  createApplicationGroupAssignment: jest.fn(),
  deactivateUser: jest.fn(),
  deactivateOrDeleteUser: jest.fn(),
  deleteGroup: jest.fn(),
};
const mockOkta = {
  setupClient: () => {
    return mockOktaClient;
  },
};
const mockOrgDeviceRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
const mockAdminDataSource = {
  getRepository: jest.fn().mockReturnValue(mockOrganizationRepository),
};
let mockedOrganization: Organization;
const mockedOrgDevices: OrgDevice[] = [
  {
    uuid: '0001',
    deviceId: '0001',
    deviceSerial: '1234',
    organization: mockedOrganization,
  },
  {
    uuid: '0002',
    deviceId: '0002',
    deviceSerial: '2222',
    organization: mockedOrganization,
  },
];
mockedOrganization = {
  uuid: '0001',
  customerId: 'tenant',
  orgName: 'tenantName',
  databaseName: 't_tenant',
  oktaGroupName: 'dms_tenant',
  oktaGroupId: 'okta-0001',
  orgDevices: mockedOrgDevices,
};
const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};
const mockedUser: User = {
  uuid: '0001-0001-0001',
  firstName: 'testUserFirst',
  lastName: 'testUserLast',
  email: 'test@test.com',
  role: 'ADMIN',
  oktaId: 'okta-0001',
  registered: true,
};
const mockDataSource = {
  getRepository: jest.fn(),
};
const mockTenantDataSource = {
  getRepository: (objectLiteral: any) => {
    switch (objectLiteral) {
      case User:
        return mockUserRepository;
        break;
      case Device:
        return mockedDeviceRepository;
        break;
      case Policy:
        return mockedPolicyRepository;
        break;
      case SsoSettings:
        return mockedSsoSettingsRepository;
        break;
    }
  },
};

const testUser1: User = {
  uuid: '0001-0001-0001',
  email: 'test@test.com',
  firstName: 'testUserFirst',
  lastName: 'testUserLast',
  oktaId: 'okta-0001',
  role: 'ADMIN',
  registered: true,
};
const mockedDevice = {
  id: '111',
  deviceSerial: '111111',
  sfdcAccountId: 'accountId',
  email: 'email@email.com',
  expirationDate: new Date('2023-04-17T11:04:00.000Z'),
  purchasedDate: new Date('2023-04-17T11:04:00.000Z'),
  model: '1100',
  policy: {
    id: '0001',
    deviceName: 'deviceName1',
    hostName: 'hostname',
    isDeviceNameModified: false,
    ipAssignment: 'DHCP',
    isAddressModified: false,
    staticAddress: {
      id: '123',
      dnsServers: [],
      gateway: '2.2.2.2',
      ipAddress: '1.1.1.1',
      netmask: '255.255.255.0',
    },
    timeSettingShort: 'PST',
    timeSettingLong: 'Pacific Standard Time',
    isTimeSettingsModified: false,
    ntpServers: [],
    dnsServers: [],
    reportingOptionsType: 'ELK',
    reportingOptionsELK: {},
    isReportingOptionsELKModified: false,
    reportingOptionsNX: {},
    isReportingOptionsNXModified: false,
    isConfigModified: false,
    enableUpgrade: true,
    upgradeDate: new Date('2023-04-17T11:04:00.000Z'),
    engineSettings: {},
    dhcpSettings: {},
    ipAddress: '1.1.1.1',
    lastConnectionTime: new Date('2023-04-17T11:04:00.000Z'),
    createdAt: new Date('2023-04-17T11:04:00.000Z'),
    updatedAt: new Date('2023-04-17T11:04:00.000Z'),
  } as unknown as Policy,
  sharedUsers: [testUser1],
  createdAt: new Date('2023-04-17T11:04:00.000Z'),
  updatedAt: new Date('2023-04-17T11:04:00.000Z'),
};
const mockedDeviceRepository = {
  createQueryBuilder: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  relation: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orIgnore: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(true),
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  // findOne: jest.fn().mockResolvedValue(mockedDevice),
};
const mockedSsoSettingsRepository = { ...mockedDeviceRepository };

const mockedPolicyRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
};
describe('AdminService', () => {
  let service: AdminService;
  let organizationRepository;
  let mockAdminDataSource;
  let okta: Okta;
  let connectionPoolService: ConnectionPoolService;
  let tenantDataSource: DataSource;

  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: ADMIN_DATA_SOURCE,
          useValue: {
            getRepository: (objectLiteral: any) => {
              switch (objectLiteral) {
                case OrgDevice:
                  return mockOrgDeviceRepository;
                  break;
                case Organization:
                  return mockOrganizationRepository;
                  break;
              }
            },
            query: jest.fn(),
          },
        },
        PrimaryDataSourceService,
        TenantsService,
        {
          provide: ConnectionPoolService,
          useValue: {
            initializeTenantDataSource: jest
              .fn()
              .mockResolvedValue(mockTenantDataSource),
            addTenantToConnectionMap: jest.fn().mockResolvedValue(true),
            getTenantDataSource: jest
              .fn()
              .mockReturnValue(mockTenantDataSource),
          },
        },
        { provide: Okta, useValue: mockOkta },
        ConfigService,
        OktaSdkConfig,
        {
          provide: 'REQUEST',
          useValue: {
            user: { sub: 'test@test.com' },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: () => {
              return 'ENCRYPTKEY';
            },
          },
        },
      ],
    }).compile();
    mockAdminDataSource = await module.resolve<DataSource>('ADMIN_DATA_SOURCE');
    organizationRepository = mockAdminDataSource.getRepository(Organization);
    service = await module.get<AdminService>(AdminService);
    okta = module.get(Okta);
    connectionPoolService = await module.get<ConnectionPoolService>(
      ConnectionPoolService,
    );
    tenantDataSource = connectionPoolService.getTenantDataSource('test');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getOrganizationName', () => {
    it('should return OrgName', async () => {
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValue(mockedOrganization);

      const organization = await service.getOrganizationName('tenant');
      expect(organization).toEqual(mockedOrganization.orgName);
      expect(organizationRepository.findOne).toHaveBeenCalledWith({
        where: { customerId: 'tenant' },
        select: ['orgName'],
      });
    });
  });
  describe('generateDatabaseAndOktaGroupName', () => {
    it('should return dbName and oktaGroupName', () => {
      const customerId = 'tenant';
      const result = service.generateDatabaseAndOktaGroupName(customerId);
      expect(result).toEqual({
        databaseName: 't_tenant',
        oktaGroupName: 'dms_tenant',
      });
    });
    describe('getOktaGroup', () => {
      it('should return OktaGroupId', async () => {
        jest
          .spyOn(organizationRepository, 'findOne')
          .mockResolvedValue(mockedOrganization);
        const result = await service.getOktaGroup('tenant');
        expect(result).toEqual(mockedOrganization.oktaGroupId);
      });
    });
  });
  describe('getOktaGroupName', () => {
    it('should return OktaGroupName', async () => {
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValue(mockedOrganization);
      const result = await service.getOktaGroupName('tenant');
      expect(result).toEqual(mockedOrganization.oktaGroupName);
    });
  });
  describe('createOrganizationAdmin', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'testUserFirst',
      lastName: 'testUserLast',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    it('should return new user', async () => {
      oktaGetUser.mockResolvedValue(null);
      jest
        .spyOn(mockOktaClient, 'createUser')
        .mockResolvedValue({ id: 'okta-user-0001' });

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockedUser);

      const oktaGetUserMock = jest.spyOn(getOktaUserModule, 'oktaGetUser');
      oktaGetUserMock.mockResolvedValue(null);

      const result = await service.createOrganizationAdmin(
        createUserDto,
        mockedOrganization,
        tenantDataSource,
      );
      expect(result).toBe(mockedUser);
      expect(oktaGetUserMock).toBeCalledWith(
        createUserDto.email,
        mockOktaClient,
      );
      expect(result.role).toEqual('ADMIN');
    });

    it('should return existed user', async () => {
      const oktaGetUserMock = jest.spyOn(getOktaUserModule, 'oktaGetUser');
      oktaGetUserMock.mockResolvedValue(true);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockedUser);

      const result = await service.createOrganizationAdmin(
        createUserDto,
        mockedOrganization,
        tenantDataSource,
      );

      expect(result).toBe(mockedUser);
      expect(result.role).toEqual('ADMIN');
    });
  });
  describe('createOrganization', () => {
    it('should create Organization', async () => {
      oktaGetGroup.mockReturnValue(null);
      jest
        .spyOn(mockOktaClient, 'createGroup')
        .mockResolvedValue({ id: 'okta-group-01' });
      jest
        .spyOn(mockOktaClient, 'createApplicationGroupAssignment')
        .mockResolvedValue(true);
    });
  });
  describe('createOrganizationRepository', () => {
    it('should return new DataSource', async () => {
      jest.spyOn(mockAdminDataSource, 'query').mockResolvedValue(true);
      const result = await service.createOrganizationRepository(
        mockedOrganization,
      );
      expect(result).toBe(mockTenantDataSource);
      expect(mockAdminDataSource.query).toHaveBeenNthCalledWith(
        1,
        `SELECT datname FROM pg_database WHERE datname='${mockedOrganization.databaseName}'`,
      );
      expect(mockAdminDataSource.query).toHaveBeenNthCalledWith(
        3,
        `CREATE DATABASE ${mockedOrganization.databaseName}`,
      );
      expect(mockAdminDataSource.query).toHaveBeenNthCalledWith(
        4,
        `GRANT ALL PRIVILEGES ON DATABASE ${mockedOrganization.databaseName} TO ${mockedOrganization.databaseName};`,
      );
    });
  });
  describe('saveDevice', () => {
    it('should return createdDevice', async () => {
      jest
        .spyOn(mockedDeviceRepository, 'findOne')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(
          mockedDeviceRepository
            .createQueryBuilder()
            .insert()
            .into()
            .values()
            .orIgnore(),
          'execute',
        )
        .mockResolvedValue(true);
      jest
        .spyOn(mockedDeviceRepository, 'findOne')
        .mockResolvedValue(mockedDevice);
      jest
        .spyOn(mockedDeviceRepository, 'save')
        .mockResolvedValue(mockedDevice);
      const result = await service['saveDevice'](
        mockedDevice,
        tenantDataSource,
      );
      expect(result).toBe(mockedDevice);
      expect(mockedDeviceRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          deviceSerial: mockedDevice.deviceSerial,
          revisionOf: IsNull(),
        },
      });
      expect(
        mockedDeviceRepository
          .createQueryBuilder()
          .insert()
          .into()
          .values()
          .orIgnore('deviceSerial').execute,
      ).toBeCalledTimes(2);
      expect(mockedDeviceRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          deviceSerial: mockedDevice.deviceSerial,
          revisionOf: IsNull(),
        },
      });
      expect(mockedDeviceRepository.save).toHaveBeenNthCalledWith(
        1,
        mockedDevice,
      );
    });
    it('should return existed device', async () => {
      jest
        .spyOn(mockedDeviceRepository, 'findOne')
        .mockResolvedValueOnce(mockedDevice);
      const result = await service['saveDevice'](
        mockedDevice,
        tenantDataSource,
      );
      expect(result).toBe(mockedDevice);
    });
  });
  describe('saveOrgDevice', () => {
    const mockedOrgDeviceRecord: OrgDevice = {
      deviceSerial: mockedDevice.deviceSerial,
      deviceId: mockedDevice.id,
      organization: mockedOrganization,
      uuid: '111',
    };
    it('should return existed OrgDevice record', async () => {
      jest
        .spyOn(mockOrgDeviceRepository, 'findOne')
        .mockResolvedValue(mockedOrgDeviceRecord);
      const result = await service['saveOrgDevice'](
        mockedDevice.id,
        mockedDevice.deviceSerial,
        mockedOrganization,
      );
      expect(result).toBe(mockedOrgDeviceRecord);
    });
    it('should return new OrgDevice record', async () => {
      jest.spyOn(mockOrgDeviceRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(mockOrgDeviceRepository, 'save')
        .mockResolvedValue(mockedOrgDeviceRecord);
      const result = await service['saveOrgDevice'](
        mockedDevice.id,
        mockedDevice.deviceSerial,
        mockedOrganization,
      );

      expect(result).toBe(mockedOrgDeviceRecord);
      expect(mockOrgDeviceRepository.save).toBeCalled();
    });
  });
  describe('handleSalesforceRequest', () => {
    const mockRequest: SalesforceDeviceRequestDto = {
      deviceSerial: 'UT_adminService',
      sfdcAccountId: 'UT',
      companyName: 'UnitTest',
      firstName: 'firstName',
      lastName: 'lastName13',
      email: 'test@test.com',
      expirationDate: new Date('2023-12-01'),
      model: '1100',
      purchasedDate: new Date('2023-02-05'),
    };
    it('should handle Salesforce request when organization does not exist', async () => {
      // Mock methods and dependencies
      service.getOrganization = jest.fn().mockResolvedValue(null);
      service.createOrganization = jest
        .fn()
        .mockResolvedValue(mockedOrganization);
      service['connectionPoolService'].initializeTenantDataSource = jest
        .fn()
        .mockResolvedValue(mockDataSource);
      service['saveDevice'] = jest.fn().mockResolvedValue(mockedDevice);
      jest
        .spyOn(mockDataSource, 'getRepository')
        .mockReturnValue(mockUserRepository);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockedUser);

      const result = await service.handleSalesforceRequest(mockRequest);

      expect(service.getOrganization).toBeCalledWith(mockRequest.sfdcAccountId);
      expect(service.createOrganization).toBeCalled();
      expect(mockUserRepository.findOne).toBeCalledWith({
        where: { email: mockRequest.email },
      });
    });
    it('should handle Salesforce request when organization exists', async () => {
      // Mock methods and dependencies
      service.getOrganization = jest.fn().mockResolvedValue(mockedOrganization);
      service['connectionPoolService'].getTenantDataSource = jest
        .fn()
        .mockReturnValue(mockDataSource);
      service['saveDevice'] = jest.fn().mockResolvedValue(mockedDevice);
      jest
        .spyOn(mockDataSource, 'getRepository')
        .mockReturnValue(mockUserRepository);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockedUser);

      const result = await service.handleSalesforceRequest(mockRequest);

      expect(service.getOrganization).toBeCalledWith(mockRequest.sfdcAccountId);
      expect(
        service['connectionPoolService'].getTenantDataSource,
      ).toBeCalledWith(mockedOrganization.customerId.toLowerCase());
    });

    it('should handle Salesforce request when admin user does not exist', async () => {
      service.getOrganization = jest.fn().mockResolvedValue(mockedOrganization);
      service['connectionPoolService'].getTenantDataSource = jest
        .fn()
        .mockReturnValue(mockDataSource);
      jest
        .spyOn(mockDataSource, 'getRepository')
        .mockReturnValue(mockUserRepository);
      service.createOrganizationAdmin = jest.fn().mockResolvedValue(mockedUser);
      service['saveDevice'] = jest.fn().mockResolvedValue(mockedDevice);

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      const result = await service.handleSalesforceRequest(mockRequest);

      expect(mockUserRepository.findOne).toBeCalledWith({
        where: { email: mockRequest.email },
      });
      expect(service.createOrganizationAdmin).toBeCalledWith(
        {
          firstName: mockRequest.firstName,
          lastName: mockRequest.lastName,
          email: mockRequest.email,
          role: 'ADMIN',
        },
        mockedOrganization,
        mockDataSource,
      );
    });
  });
});
