// admin-admin-database-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TenantDatabaseConfigService {
  constructor(private configService: ConfigService) {}

  public createTypeOrmOptions(databaseName: string): DataSourceOptions {
    // Options for the admin database
    return {
      type: 'postgres',
      host: this.configService.get('PRIMARY_DB_HOST'),
      port: +this.configService.get('PRIMARY_DB_PORT'),
      username: this.configService.get('PRIMARY_DB_USERNAME'),
      password: this.configService.get('PRIMARY_DB_PASSWORD'),
      database: databaseName,
      logging: true,
      synchronize: false,
      entities: ['dist/**/entities/*.entity.js'],
      migrations: ['dist/db/migrations/*.js'],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
