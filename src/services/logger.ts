import { pino } from 'pino';
import { env } from './env.js';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  level: env.LOG_LEVEL,
});
