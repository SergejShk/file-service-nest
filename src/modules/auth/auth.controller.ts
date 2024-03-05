import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';

import { AuthGuard } from 'src/shared/guards/auth.guard';
import { DUser } from 'src/shared/decorators/user.decorator';
import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';

import { IUser } from '../users/users.interface';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(201)
  @ApiOperation({ summary: 'Sign up new user' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'User with such email already exists' })
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseResponse<IUser>> {
    const { accessToken, refreshToken, ...newUser } =
      await this.authService.signUp(signUpDto);

    this.setCookies({ res, accessToken, refreshToken });
    return okResponse(newUser);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async logIn(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseResponse<IUser>> {
    const { accessToken, refreshToken, ...newUser } =
      await this.authService.login(signUpDto);

    this.setCookies({ res, accessToken, refreshToken });
    return okResponse(newUser);
  }

  @Get('me')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiUnauthorizedResponse({ description: 'Auth failed' })
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@DUser() user: IUser): Promise<BaseResponse<IUser>> {
    return okResponse(user);
  }

  @Get('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshAccessTokenesh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseResponse<boolean>> {
    const reqRefreshToken = req.cookies['refreshToken'];

    if (!reqRefreshToken) {
      throw new HttpException("Can't find refresh token", HttpStatus.FORBIDDEN);
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(reqRefreshToken);

    this.setCookies({ res, accessToken, refreshToken });

    return okResponse(true);
  }

  @Get('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Log out user' })
  async logOut(
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseResponse<boolean>> {
    this.clearCookies(res);

    return okResponse(true);
  }

  private setCookies = ({
    res,
    accessToken,
    refreshToken,
  }: {
    res: Response;
    accessToken: string;
    refreshToken: string;
  }): Response => {
    const expireAccessToken = new Date();
    expireAccessToken.setHours(expireAccessToken.getHours() + 1);

    const expireRefreshToken = new Date();
    expireRefreshToken.setHours(expireRefreshToken.getHours() + 7 * 24);

    const options: CookieOptions = {
      secure: true,
      httpOnly: false,
      sameSite: 'none',
    };

    res.cookie('accessToken', accessToken, {
      ...options,
      expires: expireAccessToken,
    });

    res.cookie('refreshToken', refreshToken, {
      ...options,
      expires: expireRefreshToken,
    });

    return res;
  };

  private clearCookies = (res: Response): Response => {
    const options: CookieOptions = {
      secure: true,
      httpOnly: false,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);

    return res;
  };
}
