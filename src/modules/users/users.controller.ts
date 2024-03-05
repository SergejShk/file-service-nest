import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UserEntity } from './user.entity';

import { AuthGuard } from 'src/shared/guards/auth.guard';
import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiOperation({ summary: 'Get all user' })
  async getUsers(): Promise<BaseResponse<UserEntity[]>> {
    const users = await this.usersService.getAll();

    return okResponse(users);
  }
}
