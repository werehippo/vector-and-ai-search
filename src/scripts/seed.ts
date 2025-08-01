import 'dotenv/config';
import { ensureDenseIndex, ensureSparseIndex } from '../lib/pinecone.js';
import { logger } from '../services/logger.js';

const main = async () => {
  logger.info('START: Seeding Pinecone indexes...');
  await Promise.all([ensureDenseIndex(), ensureSparseIndex()]);
  logger.info('END: Seeding Pinecone indexes completed successfully.');
  process.exit(0);
};
main();
