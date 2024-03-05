import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FolderEntity } from '../folders/folders.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => FolderEntity, (folders) => folders.userId)
  photos: FolderEntity[];
}
