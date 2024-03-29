import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { UserEntity } from '../users/user.entity';
import { FilesEntity } from '../files/files.entity';

@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isPublic: boolean;

  @Column('int', { array: true, nullable: true })
  editorsIds: number[];

  @Column({ nullable: true })
  parentId: number;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @OneToMany(() => FilesEntity, (files) => files.folderId)
  files: FilesEntity[];
}
