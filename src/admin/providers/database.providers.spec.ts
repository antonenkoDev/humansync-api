import { Test, TestingModule } from '@nestjs/testing';
import { createAdminDataSource } from '../../../db/admin-data-source';
import { ADMIN_DATA_SOURCE, DatabaseProviders } from './database.providers';

// Mock the createAdminDataSource function and its initialize method
jest.mock('../../../db/admin-data-source', () => ({
  createAdminDataSource: jest.fn().mockReturnValue({
    initialize: jest.fn().mockResolvedValue('mockDataSource'),
  }),
}));

describe('DatabaseProviders', () => {
  let dataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...DatabaseProviders],
    }).compile();

    dataSource = await module.get(ADMIN_DATA_SOURCE);
  });

  it('should create and initialize the admin data source', async () => {
    expect(createAdminDataSource).toHaveBeenCalled();
    expect(createAdminDataSource().initialize).toHaveBeenCalled();
    expect(dataSource).toBe('mockDataSource');
  });
});
