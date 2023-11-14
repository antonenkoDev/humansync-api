import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionPoolService } from './connection-pool.service';
import { TenantsService } from '../tenants/tenants.service';
import { PrimaryDataSourceService } from '../primary-data-source/primary-data-source.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Tenant } from '../tenants/tenant';
import { BadRequestException, Logger } from '@nestjs/common';

describe('ConnectionPoolService', () => {
  let service: ConnectionPoolService;
  let tenantsService: TenantsService;
  let primaryDataSourceService: PrimaryDataSourceService;
  let logger: Logger;

  const mockDataSourceInstance: Partial<jest.Mocked<DataSource>> = {
    initialize: jest.fn(),
    runMigrations: jest.fn(),
  };

  const mockDataSource = mockDataSourceInstance as unknown as DataSource;

  const tenant: Tenant = {
    orgId: 'liveaction',
    dbName: 't_liveaction',
    orgName: 'LiveAction',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionPoolService,
        {
          provide: TenantsService,
          useValue: {
            getTenants: jest.fn().mockResolvedValue([tenant]),
          },
        },
        {
          provide: PrimaryDataSourceService,
          useValue: {
            createDatasourceOptions: jest.fn().mockReturnValue(mockDataSource),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
    logger = new Logger();
    jest.spyOn(logger, 'log');
    jest.spyOn(logger, 'error').mockImplementation(() => {
      return {};
    });

    service = await module.resolve<ConnectionPoolService>(
      ConnectionPoolService,
    );
    Object.defineProperty(service, 'logger', {
      value: logger,
    });
    tenantsService = await module.resolve<TenantsService>(TenantsService);
    primaryDataSourceService = await module.resolve<PrimaryDataSourceService>(
      PrimaryDataSourceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should log "module init" and call generateConnections', async () => {
      // Mock DataSource's initialize and runMigrations to resolve immediately
      jest
        .spyOn(DataSource.prototype, 'initialize')
        .mockResolvedValue(null as any);
      jest
        .spyOn(DataSource.prototype, 'runMigrations')
        .mockResolvedValue(null as any);
      const logSpy = jest.spyOn(logger, 'log');
      await service.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith('module init');
    });
  });

  describe('getTenantDataSource', () => {
    it('should get the data source for a tenant', () => {
      service['connections'].set(tenant.orgId, mockDataSource);
      const dataSource = service.getTenantDataSource(tenant.orgId);
      expect(dataSource).toBeDefined();
    });

    it('should throw a BadRequestException if tenant data source is not found', async () => {
      const unknownTenantId = 'unknown_tenant';
      // Spy on the logger to mock its implementation and suppress logs in test output.
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      try {
        await service.getTenantDataSource(unknownTenantId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toEqual(
          new BadRequestException('Could not Find Organization Data Source'),
        );
      }

      jest.restoreAllMocks();
    });
  });
  describe('initializeTenantDataSource', () => {
    it('should initialize and run migrations for the new data source', async () => {
      const mockDbName = 'test_db';
      const mockDataSourceOptions: DataSourceOptions = {
        type: 'postgres',
        host: 'localhost',
        port: 3306,
        username: 'username',
        password: 'password',
        database: 'test',
      };

      jest
        .spyOn(primaryDataSourceService, 'createDatasourceOptions')
        .mockReturnValue(mockDataSourceOptions);

      const initializeSpy = jest
        .spyOn(DataSource.prototype, 'initialize')
        .mockResolvedValue(new DataSource(mockDataSourceOptions));

      const runMigrationsSpy = jest
        .spyOn(DataSource.prototype, 'runMigrations')
        .mockResolvedValue(undefined);

      const result = await service.initializeTenantDataSource(mockDbName);

      expect(
        primaryDataSourceService.createDatasourceOptions,
      ).toHaveBeenCalledWith(mockDbName);
      expect(initializeSpy).toHaveBeenCalled();
      expect(runMigrationsSpy).toHaveBeenCalled();
      expect(result).toBeInstanceOf(DataSource);
    });

    it('should log an error and not throw if the data source fails to initialize', async () => {
      const errorMessage = 'Initialization failed';
      jest
        .spyOn(primaryDataSourceService, 'createDatasourceOptions')
        .mockImplementation(() => {
          throw new Error(errorMessage);
        });
      const errorLoggerSpy = jest
        .spyOn(logger, 'error')
        .mockImplementation(() => {
          return {};
        });

      await expect(
        service.initializeTenantDataSource(tenant.dbName),
      ).resolves.toBeUndefined();

      expect(errorLoggerSpy).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
  describe('addTenantToConnectionMap', () => {
    it('should add the data source to the connection map', () => {
      service.addTenantToConnectionMap(tenant.orgId, mockDataSource);

      const dataSource = service.getTenantDataSource(tenant.orgId);
      expect(dataSource).toBe(mockDataSource);
    });
  });
});
