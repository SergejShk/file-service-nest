import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FoldersService } from './folders.service';
import { FolderEntity } from './folders.entity';

import { CreateFolderDto } from './dto/createFolder.dto';
import { FoldersByParentIdDto } from './dto/foldersByParentId.dto';
import { UpdateFolderDto } from './dto/updateFolder.dto';
import { UpdateFolderEditorsDto } from './dto/updateFoldersEditors.dto';

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
  @ApiOperation({ summary: 'Create folder' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
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
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
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

  @Put('update/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update folder by id' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async updateFolder(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<BaseResponse<FolderEntity>> {
    const folders = await this.foldersService.update(
      Number(id),
      updateFolderDto,
    );

    return okResponse(folders);
  }

  @Put('update-editors/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Update folder's editors" })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async updateEditors(
    @Param('id') id: string,
    @Body() updateFolderEditorsDto: UpdateFolderEditorsDto,
  ): Promise<BaseResponse<FolderEntity>> {
    const folders = await this.foldersService.updateEditors(
      Number(id),
      updateFolderEditorsDto.editorsIds,
    );

    return okResponse(folders);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove folder' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiForbiddenResponse({ description: 'User does not owns folder' })
  @ApiNoContentResponse({ description: 'Folder deleted' })
  async deleteFolder(
    @DUser() user: IUser,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.foldersService.deleteFolder(user.id, Number(id));
  }
}
