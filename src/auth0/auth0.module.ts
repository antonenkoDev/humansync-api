import { Module } from '@nestjs/common';
import { Auth0Service } from './auth0.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [Auth0Service],
  exports: [Auth0Service],
})
export class Auth0Module {}
