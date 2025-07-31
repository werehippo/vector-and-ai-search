import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as loggerMiddleware } from 'hono/logger';
import { timeout } from 'hono/timeout';
import { getCompletion } from '../lib/gemini.js';
import { env } from '../services/env.js';
import { logger } from '../services/logger.js';

const apiV1 = new Hono();
apiV1.get('/chat-completion', async (c) => {
  const { prompt } = c.req.query();

  const sanitizedPrompt = (prompt || '').trim();
  if (!sanitizedPrompt) {
    return c.json(
      {
        error: 'Prompt query parameter is required',
      },
      400
    );
  }

  const completion = await getCompletion(sanitizedPrompt);
  return c.json({ completion });
});

const app = new Hono()
  .use(
    loggerMiddleware((message: string, ...rest: string[]) => {
      logger.info(message, ...rest);
    })
  )
  .use(cors())
  .use(timeout(10_000))
  .notFound((c) => {
    return c.json(
      {
        error: 'Not Found',
      },
      404
    );
  });

app
  .get('/health', (c) => {
    return c.json({
      status: 'ok',
      timeStamp: new Date().toISOString(),
    });
  })
  .route('/api/v1', apiV1);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);
