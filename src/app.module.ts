import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [DbModule, UserModule, TeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
