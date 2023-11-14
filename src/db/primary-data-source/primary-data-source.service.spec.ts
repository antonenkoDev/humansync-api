import { Test, TestingModule } from '@nestjs/testing';
import { PrimaryDataSourceService } from './primary-data-source.service';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';

describe('PrimaryDataSourceService', () => {
  let service: PrimaryDataSourceService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrimaryDataSourceService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PrimaryDataSourceService>(PrimaryDataSourceService);
    configService = module.get<ConfigService>(ConfigService);
  });
  describe('createDatasourceOptions', () => {
    it('should return DataSourceOptions with the correct configuration', () => {
      const tenantDb = 'test_db';
      const mockConfig = {
        PRIMARY_DB_HOST: 'localhost',
        PRIMARY_DB_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PW: 'password',
      };

      jest
        .spyOn(configService, 'get')
        .mockImplementation((key: string) => mockConfig[key]);

      const result = service.createDatasourceOptions(tenantDb);

      expect(result).toEqual({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'password',
        database: tenantDb,
        synchronize: false,
        entities: ['dist/**/entities/**/!(*.admin.entity).js'],
        migrations: ['dist/db/migrations/*.js'],
        namingStrategy: expect.any(SnakeNamingStrategy),
      });
    });
  });
});
