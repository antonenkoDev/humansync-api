// src/migrations.ts or a similar script file
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { DatabaseModule } from './database/database.module';
import { TenantDatabaseConfigService } from 'src/database/tenant-database-config.service';

async function runMigrations(databaseName: string) {
  const appContext = await NestFactory.createApplicationContext(DatabaseModule);
  const dbConfigService = appContext.get(TenantDatabaseConfigService);
  const dataSource = new DataSource(
    dbConfigService.createTypeOrmOptions(databaseName),
  );

  await dataSource.initialize();
  // Your migration logic here
  await dataSource.destroy();
  await appContext.close();
}

const databaseName = 'dev';
runMigrations(databaseName).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
