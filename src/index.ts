import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getCompletion } from '../lib/gemini.js';
import { env } from '../services/env.js';
import { logger } from '../services/logger.js';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timeStamp: new Date().toISOString(),
  });
});

app.get('/api/v1/chat-completion', async (c) => {
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

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);
