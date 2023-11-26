// ormconfig.admin.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const createDataSourceOptions = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: 'localhost',
    port: 5555,
    username: 'postgres',
    password: 'postgres',
    database: 'dev',
    logging: true,
    entities: ['dist/**/entities/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    namingStrategy: new SnakeNamingStrategy(),
  };
};

export function createDataSource() {
  return new DataSource(createDataSourceOptions());
}

export const dataSource = createDataSource();
