import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeamModule } from './team/team.module';
import { TagModule } from './tag/tag.module';
import { AdminModule } from './admin/admin.module';
import { Auth0Module } from './auth0/auth0.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TenantIdentificationMiddleware } from './middlewares/tenant-identification.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TeamModule,
    TagModule,
    AdminModule,
    Auth0Module,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, TenantIdentificationMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantIdentificationMiddleware).forRoutes('*');
  }
}
