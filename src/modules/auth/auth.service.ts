import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import { SignUpDto } from './dto/signup.dto';

import { UsersService } from '../users/users.service';

import {
  GeneratedAuthTokens,
  ITokenPayload,
  JwtData,
  Token,
} from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email } = signUpDto;
    const user = await this.usersService.findByEmail(email);

    if (user && user.password) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    if (user) {
      const response = await this.usersService.updatePassword(
        user.id,
        signUpDto.password,
      );
      const payloadToken = {
        id: response.id,
        email: response.email,
      };

      const accessToken = this.getToken(payloadToken, Token.Access);
      const refreshToken = this.getToken(payloadToken, Token.Refresh);
      return { ...payloadToken, accessToken, refreshToken };
    }

    const newUser = await this.usersService.createUser(signUpDto);
    const payloadToken = {
      id: newUser.id,
      email: newUser.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...payloadToken, accessToken, refreshToken };
  }

  async login(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const isRightPassword = await this.usersService.comparePasswords(
      password,
      user.password,
    );

    if (!isRightPassword) {
      throw new ForbiddenException(`Password is incorrect`);
    }

    const payloadToken = {
      id: user.id,
      email: user.email,
    };
    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...payloadToken, accessToken, refreshToken };
  }

  async googleLogIn(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const payloadToken = {
        id: user.id,
        email: user.email,
      };

      const accessToken = this.getToken(payloadToken, Token.Access);
      const refreshToken = this.getToken(payloadToken, Token.Refresh);

      return { ...payloadToken, accessToken, refreshToken };
    }

    const response = await this.usersService.createUser({
      email,
    });

    const payloadToken = {
      id: response.id,
      email: response.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...payloadToken, accessToken, refreshToken };
  }

  private getToken(data: ITokenPayload, tokenType: Token) {
    const payload = {
      id: data.id,
      email: data.email,
      tokenType,
    };
    const jwtSecret = this.configService.get<string>('encrypt.jwt.secret');

    return jwt.sign(payload, jwtSecret, {
      expiresIn: tokenType === Token.Refresh ? '24h' : '1h',
    });
  }

  refreshTokens = async (token: string): Promise<GeneratedAuthTokens> => {
    const jwtSecret = this.configService.get<string>('encrypt.jwt.secret');
    const decodedToken = jwt.verify(token, jwtSecret) as JwtData;

    if (decodedToken.tokenType !== Token.Refresh) {
      throw new HttpException('Refresh token error', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersService.findByEmail(decodedToken.email);

    if (!user) {
      throw new HttpException(
        "Can't find user by refresh token",
        HttpStatus.FORBIDDEN,
      );
    }

    const payloadToken = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { accessToken, refreshToken };
  };
}
