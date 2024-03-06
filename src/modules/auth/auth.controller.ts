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
import axios from 'axios';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';

import { AuthGuard } from 'src/shared/guards/auth.guard';
import { DUser } from 'src/shared/decorators/user.decorator';
import { BaseResponse, okResponse } from 'src/shared/api/baseResponses';

import { IUser } from '../users/users.interface';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private googleClientId: string;
  private googleClientSecret: string;
  private baseUrl: string;
  private feBaseUrl: string;

  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>('google.clientId');
    this.googleClientSecret = this.configService.get<string>(
      'google.clientSecret',
    );
    this.baseUrl = this.configService.get<string>('api.baseUrl');
    this.feBaseUrl = this.configService.get<string>('api.feBaseUrl');
  }

  @Post('sign-up')
  @HttpCode(201)
  @ApiOperation({ summary: 'User registration' })
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
  @ApiOperation({ summary: 'User login' })
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

  @Get('google')
  @HttpCode(200)
  @ApiOperation({ summary: 'Google authorization' })
  async googleAuth(@Res({ passthrough: true }) res: Response) {
    const stringifiedParams = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: `${this.baseUrl}/api/auth/google-redirect`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    }).toString();

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`,
    );
  }

  @Get('google-redirect')
  @HttpCode(200)
  @ApiOperation({ summary: 'Google redirect endpoint' })
  async googleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const code = req.query.code;

    try {
      const tokenData = await axios({
        url: `https://oauth2.googleapis.com/token`,
        method: 'post',
        data: {
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          redirect_uri: `${this.baseUrl}/api/auth/google-redirect`,
          grant_type: 'authorization_code',
          code,
        },
      });

      const userData = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${tokenData.data.access_token}`,
        },
      });

      const { accessToken, refreshToken } = await this.authService.googleLogIn(
        userData.data.email,
      );
      this.setCookies({ res, accessToken, refreshToken });

      return res.redirect(`${this.feBaseUrl}`);
    } catch (error) {
      console.log(error);
    }
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
  @ApiOperation({ summary: 'User logout' })
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
