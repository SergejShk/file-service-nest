import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Endpoint, S3 } from 'aws-sdk';

import { FilesEntity } from './files.entity';

import { NewFileDto } from './dto/newFile.dto';

import { IS3PresignedPostResponse } from './files.interface';

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
}
