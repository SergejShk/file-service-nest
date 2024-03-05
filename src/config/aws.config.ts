import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const awsConfig = registerAs('aws', () => {
  return convict({
    s3Region: {
      doc: 'Bucket location',
      format: String,
      default: null,
      env: 'S3_REGION',
    },
    s3BucketName: {
      doc: 'Bucket name',
      format: String,
      default: null,
      env: 'S3_BUCKET_NAME',
    },
  })
    .validate()
    .getProperties();
});
