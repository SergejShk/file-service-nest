import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FilesService } from './files.service';
import { FilesEntity } from './files.entity';

import { AuthGuard } from 'src/shared/guards/auth.guard';
import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';
import { DUser } from 'src/shared/decorators/user.decorator';

import { CreatePresignedLinkDto } from './dto/createPresignedLink.dto';
import { NewFileDto } from './dto/newFile.dto';

import { IS3PresignedPostResponse } from './files.interface';
import { IUser } from '../users/users.interface';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presigned-link')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create presigned link' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async createPresignedPost(
    @Body() createPresignedLinkDto: CreatePresignedLinkDto,
  ): Promise<BaseResponse<IS3PresignedPostResponse>> {
    const result = await this.filesService.createPresignedPost(
      createPresignedLinkDto.key,
      createPresignedLinkDto.type,
    );

    return okResponse(result);
  }

  @Post('new')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create file' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async createFile(
    @DUser() user: IUser,
    @Body() newFileDto: NewFileDto,
  ): Promise<BaseResponse<FilesEntity>> {
    const result = await this.filesService.create(newFileDto, user.id);

    return okResponse(result);
  }
}
