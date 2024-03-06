import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

import { UserEntity } from './user.entity';
import { ISignup } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ email });
  }

  async createUser({ email, password }: ISignup): Promise<UserEntity> {
    const passwordHash = await this.createPasswordHash(password);
    return this.usersRepository.save({ email, password: passwordHash });
  }

  async updatePassword(id: number, password: string): Promise<UserEntity> {
    const passwordHash = await this.createPasswordHash(password);

    const updatedUser = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        password: passwordHash,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedUser.raw[0];
  }

  private async createPasswordHash(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>(
      'encrypt.bcrypt.saltRounds',
    );

    return bcryptjs.hash(password, saltRounds);
  }

  async comparePasswords(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcryptjs.compare(password, passwordHash);
  }
}
