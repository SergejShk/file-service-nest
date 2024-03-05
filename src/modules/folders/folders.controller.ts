import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FoldersService } from './folders.service';
import { FolderEntity } from './folders.entity';

import { CreateFolderDto } from './dto/createFolder.dto';
import { FoldersByParentIdDto } from './dto/foldersByParentId.dto';

import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';
import { DUser } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { IUser } from '../users/users.interface';

@Controller('folders')
@ApiTags('Folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('new')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create new folder' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async createFolder(
    @DUser() user: IUser,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<BaseResponse<FolderEntity>> {
    const newFolder = await this.foldersService.create(
      createFolderDto,
      user.id,
    );

    return okResponse(newFolder);
  }

  @Post('list-by-parent/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get folders by parent id' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async getFoldersByParentId(
    @DUser() user: IUser,
    @Param('id') id: string,
    @Body() folderByParentIdDto: FoldersByParentIdDto,
  ): Promise<BaseResponse<FolderEntity[]>> {
    const folders = await this.foldersService.getListByParentId(
      user.id,
      Number(id),
      folderByParentIdDto.name,
    );

    return okResponse(folders);
  }
}
