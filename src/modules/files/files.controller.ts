import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { FilesByFolderDto } from './dto/filesByFolder.dto';

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

  @Post('list-by-folder/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get files by folder' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async getFilesByFolderId(
    @DUser() user: IUser,
    @Param('id') id: string,
    @Body() filesByFolderDto: FilesByFolderDto,
  ): Promise<BaseResponse<FilesEntity[]>> {
    const result = await this.filesService.getListByFolderId(
      user.id,
      Number(id),
      filesByFolderDto.name,
    );

    return okResponse(result);
  }
}
