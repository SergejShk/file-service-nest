import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  password: string;
}
