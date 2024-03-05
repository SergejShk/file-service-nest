import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/createFolder.dto';

import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';
import { DUser } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { IUser } from '../users/users.interface';
import { FolderEntity } from './folders.entity';

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
}
