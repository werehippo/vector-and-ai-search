import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { env } from '../services/env.js';
import { logger } from '../services/logger.js';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timeStamp: new Date().toISOString(),
  });
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);
