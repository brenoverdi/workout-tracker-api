import { config } from './env.config';

const envConfig = config();

export const redisConfig = {
  host: envConfig.redis.host,
  port: envConfig.redis.port,
  password: envConfig.redis.password,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};
