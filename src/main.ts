import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { configureApp } from './configure-app';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  configureApp(app, configService);

  await app.listen(configService.get<number>('api.port'));
}
bootstrap();
