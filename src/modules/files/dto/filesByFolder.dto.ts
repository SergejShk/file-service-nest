import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FilesByFolderDto {
  @ApiProperty()
  @IsString()
  name: string;
}
