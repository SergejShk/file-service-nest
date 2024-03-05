import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderEntity } from './folders.entity';

import { CreateFolderDto } from './dto/createFolder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private foldersRepository: Repository<FolderEntity>,
  ) {}

  async create(folder: CreateFolderDto, userId: number) {
    const newFolder = { ...folder, userId };

    return this.foldersRepository.save(newFolder);
  }
}
