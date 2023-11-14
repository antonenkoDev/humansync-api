import { Injectable } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrimaryDataSourceService {
  constructor(private configService: ConfigService) {}
  createDatasourceOptions(tenantDb: string): DataSourceOptions {
    try {
      return {
        type: 'postgres',
        host: this.configService.get('PRIMARY_DB_HOST'),
        port: parseInt(this.configService.get('PRIMARY_DB_PORT'), 10),
        username: this.configService.get('POSTGRES_USER'),
        password: this.configService.get('POSTGRES_PW'),
        database: tenantDb,
        synchronize: false,
        entities: ['dist/**/entities/**/!(*.admin.entity).js'],
        migrations: ['dist/db/migrations/*.js'],
        namingStrategy: new SnakeNamingStrategy(),
      };
    } catch (err: any) {
      throw err;
    }
  }
}
