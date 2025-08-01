import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as loggerMiddleware } from 'hono/logger';
import { timeout } from 'hono/timeout';
import { getCompletion, getCompletionWithRAG } from './lib/gemini.js';
import {
  runHybridSearch,
  runLexicalSearch,
  runSemanticSearch,
} from './lib/pinecone.js';
import { env } from './services/env.js';
import { logger } from './services/logger.js';

const apiV1 = new Hono();
apiV1
  .get('/chat-completion', async (c) => {
    const { q } = c.req.query();

    const sanitizedQuery = (q || '').trim();
    if (!sanitizedQuery) {
      return c.json({ message: 'q query parameter is required' }, 400);
    }

    const completion = await getCompletion(sanitizedQuery);
    return c.json({ completion });
  })
  .get('/chat-completion-with-rag', async (c) => {
    const { q } = c.req.query();

    const sanitizedQuery = (q || '').trim();
    if (!sanitizedQuery) {
      return c.json({ message: 'q query parameter is required' }, 400);
    }

    const searchResult = await runSemanticSearch(sanitizedQuery);
    const ragContext = searchResult
      .map((item) => item.metadata.chunkText)
      .join('\n\n');
    const completion = await getCompletionWithRAG(sanitizedQuery, ragContext);
    return c.json({ completion, context: ragContext });
  })
  .get('/semantic-search', async (c) => {
    const { q } = c.req.query();

    const sanitizedQuery = (q || '').trim();
    if (!sanitizedQuery) {
      return c.json({ message: 'q query parameter is required' }, 400);
    }

    const result = await runSemanticSearch(sanitizedQuery);
    return c.json(result);
  })
  .get('/lexical-search', async (c) => {
    const { q } = c.req.query();

    const sanitizedQuery = (q || '').trim();
    if (!sanitizedQuery) {
      return c.json({ message: 'q query parameter is required' }, 400);
    }

    const result = await runLexicalSearch(sanitizedQuery);
    return c.json(result);
  })
  .get('/hybrid-search', async (c) => {
    const { q } = c.req.query();

    const sanitizedQuery = (q || '').trim();
    if (!sanitizedQuery) {
      return c.json({ message: 'q query parameter is required' }, 400);
    }

    const result = await runHybridSearch(sanitizedQuery);
    return c.json(result);
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
    return c.json({ message: 'Not Found' }, 404);
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
