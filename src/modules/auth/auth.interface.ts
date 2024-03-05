export enum Token {
  Access = 'access',
  Refresh = 'refresh',
}

export interface GeneratedAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  id: number;
  email: string;
}

export interface JwtData extends ITokenPayload {
  tokenType: Token;
}
