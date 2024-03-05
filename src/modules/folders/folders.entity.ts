import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { UserEntity } from '../users/user.entity';

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
}
