import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';

import { FolderEntity } from './folders.entity';

import { FilesService } from '../files/files.service';

import { CreateFolderDto } from './dto/createFolder.dto';
import { UpdateFolderDto } from './dto/updateFolder.dto';

@Injectable()
export class FoldersService {
  constructor(
    private filesService: FilesService,
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

  async update(id: number, folder: UpdateFolderDto): Promise<FolderEntity> {
    const updatedFolder = await this.foldersRepository
      .createQueryBuilder()
      .update(FolderEntity)
      .set({
        name: folder.name,
        isPublic: folder.isPublic,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedFolder.raw[0];
  }

  async updateEditors(id: number, editorsIds: number[]): Promise<FolderEntity> {
    const updatedFolder = await this.foldersRepository
      .createQueryBuilder()
      .update(FolderEntity)
      .set({
        editorsIds,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedFolder.raw[0];
  }

  async deleteFolder(userId: number, id: number): Promise<void> {
    const folder = await this.foldersRepository.findOneBy({ id });

    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    if (folder.userId !== userId) {
      throw new ForbiddenException(`User does not owns folder`);
    }

    await this.filesService.deleteManyByFolderId(userId, id);
    await this.foldersRepository.remove(folder);
  }
}
