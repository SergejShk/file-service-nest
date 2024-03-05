import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FoldersByParentIdDto {
  @ApiProperty()
  @IsString()
  name: string;
}
