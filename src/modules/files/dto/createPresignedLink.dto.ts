import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePresignedLinkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;
}
