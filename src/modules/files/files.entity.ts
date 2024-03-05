import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { UserEntity } from '../users/user.entity';
import { FolderEntity } from '../folders/folders.entity';

@Entity('files')
export class FilesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  isPublic: boolean;

  @Column('int', { array: true, nullable: true })
  editorsIds: number[];

  @Column({ nullable: true })
  folderId: number;

  @ManyToOne(() => FolderEntity, (folder) => folder.id)
  folder: FolderEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;
}
