import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { FolderEntity } from '../folders/folders.entity';
import { FilesEntity } from '../files/files.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => FolderEntity, (folders) => folders.userId)
  folders: FolderEntity[];

  @OneToMany(() => FilesEntity, (files) => files.userId)
  files: FilesEntity[];
}
