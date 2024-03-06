import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFileEditorsDto {
  @ApiProperty()
  @IsNumber({}, { each: true })
  @IsOptional()
  editorsIds: number[];
}
