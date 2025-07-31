import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1000)).default(3000),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.error(
    'Invalid environment variables:',
    z.treeifyError(parsedEnv.error)
  );
  process.exit(1);
}

export const env = parsedEnv.data;
