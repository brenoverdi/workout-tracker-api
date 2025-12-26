import { config } from './env.config';

const envConfig = config();

export const awsConfig = {
  region: envConfig.aws.region,
  credentials: {
    accessKeyId: envConfig.aws.accessKeyId,
    secretAccessKey: envConfig.aws.secretAccessKey,
  },
  s3: {
    bucketName: envConfig.aws.s3BucketName,
  },
};
