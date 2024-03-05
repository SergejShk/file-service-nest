import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import { JwtData } from 'src/modules/auth/auth.interface';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = request.cookies;

    if (!cookies || !cookies.accessToken) {
      throw new UnauthorizedException("Can't find access token");
    }

    const token = cookies.accessToken;
    const jwtSecret = this.configService.get<string>('encrypt.jwt.secret');
    const decodedUser = jwt.verify(token, jwtSecret) as JwtData;
    const response = await this.usersService.findByEmail(decodedUser.email);

    if (!response) {
      throw new UnauthorizedException('Not authorized');
    }

    const user = {
      id: response.id,
      email: response.email,
    };
    request.user = user;

    return true;
  }
}
