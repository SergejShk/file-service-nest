import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import cors from 'cors';
import * as helmet from 'helmet';

import { initSwagger } from './shared/swagger.initializer';

export function configureApp(
  app: INestApplication,
  configService: ConfigService,
): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: [configService.get<string>('api.feBaseUrl')],
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'HEAD'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: 'X-Total-Count',
    credentials: true,
  });
  app.use(
    (helmet as any)({
      contentSecurityPolicy: false,
    }),
  );

  initSwagger(app);
}
