import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderEditorsDto {
  @ApiProperty()
  @IsNumber({}, { each: true })
  @IsOptional()
  editorsIds: number[];
}
