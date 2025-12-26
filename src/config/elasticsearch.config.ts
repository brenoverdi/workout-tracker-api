import { config } from './env.config';

const envConfig = config();

export const elasticsearchConfig = {
  node: envConfig.elasticsearch.node,
  auth: envConfig.elasticsearch.auth,
  maxRetries: 3,
  requestTimeout: 60000,
  sniffOnStart: false,
};
