import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FilesService } from './files.service';

import { AuthGuard } from 'src/shared/guards/auth.guard';
import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';

import { CreatePresignedLinkDto } from './dto/createPresignedLink.dto';
import { IS3PresignedPostResponse } from './dto/files.interface';

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
}
