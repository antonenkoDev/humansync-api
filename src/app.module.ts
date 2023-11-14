import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [DbModule, UserModule, TeamModule, TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
