import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const googleConfig = registerAs('google', () => {
  return convict({
    clientId: {
      doc: 'Google client id',
      format: String,
      default: null,
      env: 'GOOGLE_CLIENT_ID',
    },
    clientSecret: {
      doc: 'Google client secret key',
      format: String,
      default: null,
      env: 'GOOGLE_CLIENT_SECRET',
    },
  })
    .validate()
    .getProperties();
});
