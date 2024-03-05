import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { FolderEntity } from './folders.entity';

import { CreateFolderDto } from './dto/createFolder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private foldersRepository: Repository<FolderEntity>,
  ) {}

  async create(folder: CreateFolderDto, userId: number): Promise<FolderEntity> {
    const newFolder = { ...folder, userId };

    return this.foldersRepository.save(newFolder);
  }

  async getListByParentId(
    userId: number,
    parentId: number,
    name: string,
  ): Promise<FolderEntity[]> {
    if (!parentId) {
      return this.foldersRepository.find({
        where: [
          { userId, parentId: IsNull(), name: ILike(`%${name}%`) },
          { isPublic: true, parentId: IsNull(), name: ILike(`%${name}%`) },
        ],
        order: {
          id: 'ASC',
        },
      });
    }

    return this.foldersRepository.find({
      where: [
        { userId, parentId, name: ILike(`%${name}%`) },
        { isPublic: true, parentId, name: ILike(`%${name}%`) },
      ],
      order: {
        id: 'ASC',
      },
    });
  }
}
