import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NewFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ obj }) => {
    return obj.isPublic === true;
  })
  isPublic: boolean;

  @ApiProperty({ required: false })
  @IsNumber({}, { each: true })
  @IsOptional()
  editorsIds: number[];

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  folderId: number;
}
