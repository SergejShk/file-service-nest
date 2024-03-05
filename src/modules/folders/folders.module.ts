import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { FolderEntity } from './folders.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UsersModule],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
