import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const encryptConfig = registerAs('encrypt', () => {
  return convict({
    jwt: {
      secret: {
        doc: 'JWT secret for token signing and verification',
        format: String,
        default: null,
        env: 'JWT_SECRET',
      },
    },
    bcrypt: {
      saltRounds: {
        doc: 'bcryptjs salt rounds',
        format: Number,
        default: null,
        env: 'BCRYPT_SALT_ROUNDS',
      },
    },
  })
    .validate()
    .getProperties();
});
