import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ILike, IsNull, Repository } from 'typeorm';
import { AWSError, Endpoint, S3 } from 'aws-sdk';

import { FilesEntity } from './files.entity';

import { NewFileDto } from './dto/newFile.dto';

import { IS3PresignedPostResponse } from './files.interface';
import { UpdateFileDto } from './dto/updateFile.dto';

@Injectable()
export class FilesService {
  private endpoint: Endpoint;
  private S3: S3;
  private bucketRegion: string;
  private bucketName: string;

  constructor(
    @InjectRepository(FilesEntity)
    private filesRepository: Repository<FilesEntity>,
    private configService: ConfigService,
  ) {
    this.bucketRegion = this.configService.get<string>('aws.s3Region');
    this.bucketName = this.configService.get<string>('aws.s3BucketName');
    this.endpoint = new Endpoint(`s3.${this.bucketRegion}.amazonaws.com`);
    this.S3 = new S3({
      endpoint: this.endpoint,
      apiVersion: '2012-10-17',
      region: this.bucketRegion,
    });
  }

  async createPresignedPost(
    key: string,
    type: string,
  ): Promise<IS3PresignedPostResponse> {
    const splitedKey = key.split('.');
    const [newKey] = splitedKey;

    const result = await this.S3.createPresignedPost({
      Bucket: this.bucketName,
      Fields: {
        key: `${newKey}-${+new Date()}.${type.split('/').pop()}`,
        'Content-Type': type,
      },
      Conditions: [{ 'Content-Type': type }],
      Expires: 600,
    });

    return result as unknown as IS3PresignedPostResponse;
  }

  async create(file: NewFileDto, userId: number): Promise<FilesEntity> {
    const newFile = { ...file, userId };
    return this.filesRepository.save(newFile);
  }

  async getListByFolderId(userId: number, folderId: number, name: string) {
    if (!folderId) {
      return this.filesRepository.find({
        where: [
          { userId, folderId: IsNull(), name: ILike(`%${name}%`) },
          { isPublic: true, folderId: IsNull(), name: ILike(`%${name}%`) },
        ],
        order: {
          id: 'ASC',
        },
      });
    }

    return this.filesRepository.find({
      where: [
        { userId, folderId, name: ILike(`%${name}%`) },
        { isPublic: true, folderId, name: ILike(`%${name}%`) },
      ],
      order: {
        id: 'ASC',
      },
    });
  }

  getObject(key: string): string {
    return encodeURI(`https://${this.bucketName}.s3.amazonaws.com/${key}`);
  }

  async update(file: UpdateFileDto, id: number): Promise<FilesEntity> {
    const updatedFile = await this.filesRepository
      .createQueryBuilder()
      .update(FilesEntity)
      .set({
        name: file.name,
        isPublic: file.isPublic,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedFile.raw[0];
  }

  async updateEditors(id: number, editorsIds: number[]): Promise<FilesEntity> {
    const updatedFile = await this.filesRepository
      .createQueryBuilder()
      .update(FilesEntity)
      .set({
        editorsIds,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedFile.raw[0];
  }

  private async deleteObject(key: string): Promise<boolean> {
    return new Promise(
      (resolve: (val: boolean) => void, reject: (val: AWSError) => void) => {
        this.S3.deleteObject(
          {
            Bucket: this.bucketName,
            Key: key,
          },
          (err: AWSError) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          },
        );
      },
    );
  }

  async deleteFile(userId: number, id: number): Promise<void> {
    const file = await this.filesRepository.findOneBy({ id });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    if (file.userId !== userId) {
      throw new ForbiddenException(`User does not owns file`);
    }

    await this.filesRepository.remove(file);
    await this.deleteObject(file.key);
  }

  async deleteManyByFolderId(userId: number, folderId: number): Promise<void> {
    const files = await this.getListByFolderId(userId, folderId, '');

    await this.filesRepository
      .createQueryBuilder()
      .delete()
      .from(FilesEntity)
      .where('folderId = :folderId', { folderId })
      .execute();

    await Promise.all(
      files.map(async (file) => await this.deleteObject(file.key)),
    );
  }
}
