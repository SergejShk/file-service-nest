import { ConfigModule } from '@nestjs/config';

import { databaseConfig } from './database.config';
import { encryptConfig } from './encrypt.config';
import { apiConfig } from './api.config';
import { awsConfig } from './aws.config';
import { googleConfig } from './google.config';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, encryptConfig, apiConfig, awsConfig, googleConfig],
});
