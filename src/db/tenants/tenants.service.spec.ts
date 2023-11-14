import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from './tenants.service';
import { Repository } from 'typeorm';
import { Organization } from '../../admin/entities/organization.admin.entity';
import { ADMIN_DATA_SOURCE } from '../../admin/providers/database.providers';

describe('TenantsService', () => {
  let service: TenantsService;
  let organizationRepository: Repository<Organization>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const mockDataSource = {
      getRepository: () => mockRepository,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: ADMIN_DATA_SOURCE,
          useValue: mockDataSource,
        },
        {
          provide: 'OrganizationRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    organizationRepository = module.get('OrganizationRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenants', () => {
    it('should return an array of tenants', async () => {
      // Arrange
      const mockOrganizations: Organization[] = [
        {
          uuid: '0001',
          orgName: 'LiveAction',
          customerId: '0001',
          databaseName: 't_0001',
          oktaGroupName: 'dms_0001',
          oktaGroupId: 'okta-0001',
          orgDevices: [],
        },
        // ... more organizations
      ];
      jest
        .spyOn(organizationRepository, 'find')
        .mockResolvedValue(mockOrganizations);

      // Act
      const tenants = await service.getTenants();

      // Assert
      expect(tenants).toEqual(expect.any(Array));
      expect(tenants).toHaveLength(mockOrganizations.length);
      expect(tenants[0].orgName).toBe(mockOrganizations[0].orgName);
    });

    it('should handle errors when fetching tenants', async () => {
      const error = new Error('Error fetching tenants');
      jest.spyOn(organizationRepository, 'find').mockRejectedValue(error);

      await expect(service.getTenants()).rejects.toThrowError(error);
    });
  });
});
