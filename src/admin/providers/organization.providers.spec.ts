import { DataSource } from 'typeorm';
import { Organization } from '../entities/organization.admin.entity';
import { ADMIN_DATA_SOURCE } from './database.providers';
import {
  ORGANIZATION_REPOSITORY,
  organizationProviders,
} from './organization.providers';

describe('organizationProviders', () => {
  it('should provide a repository', async () => {
    const mockRepository = {};

    const dataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as unknown as DataSource;

    const repositoryProvider = organizationProviders.find(
      (provider) => provider.provide === ORGANIZATION_REPOSITORY,
    );
    expect(repositoryProvider).toBeDefined();

    const repository = await repositoryProvider.useFactory(dataSource);

    expect(dataSource.getRepository).toBeCalledWith(Organization);
    expect(repository).toBe(mockRepository);
  });
});
