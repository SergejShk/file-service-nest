import { Module } from '@nestjs/common';

import { configModule } from './config/config.module';
import { databaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FoldersModule } from './modules/folders/folders.module';

@Module({
  imports: [
    configModule,
    databaseModule,
    AuthModule,
    UsersModule,
    FoldersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
