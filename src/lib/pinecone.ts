import { Pinecone } from '@pinecone-database/pinecone';
import { chain, chunk } from 'lodash-es';
import dataset from '../../sample-dataset.json' with { type: 'json' };
import { env } from '../services/env.js';

const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY });

const dataChunks = chunk(dataset, 200);

export const ensureDenseIndex = async () => {
  const indexName = env.PINECONE_DENSE_INDEX_NAME;

  const { indexes } = await pc.listIndexes();
  const hasIndex = (indexes || []).some((index) => index.name === indexName);
  if (hasIndex) {
    await pc.deleteIndex(indexName);
  }

  await pc.createIndexForModel({
    name: indexName,
    cloud: env.PINECONE_CLOUD,
    region: env.PINECONE_REGION,
    embed: {
      model: 'llama-text-embed-v2',
      fieldMap: { text: 'chunkText' },
    },
    waitUntilReady: true,
  });
  const newIndex = pc.Index(indexName);
  await Promise.all(
    dataChunks.map(async (chunkData) => newIndex.upsertRecords(chunkData))
  );
};

export const ensureSparseIndex = async () => {
  const indexName = env.PINECONE_SPARSE_INDEX_NAME;

  const { indexes } = await pc.listIndexes();
  const hasIndex = (indexes || []).some((index) => index.name === indexName);
  if (hasIndex) {
    await pc.deleteIndex(indexName);
  }
  await pc.createIndexForModel({
    name: indexName,
    cloud: env.PINECONE_CLOUD,
    region: env.PINECONE_REGION,
    embed: {
      model: 'pinecone-sparse-english-v0',
      fieldMap: { text: 'chunkText' },
    },
    waitUntilReady: true,
  });
  const newIndex = pc.Index(indexName);
  await Promise.all(
    dataChunks.map(async (chunkData) => newIndex.upsertRecords(chunkData))
  );
};

export const runSemanticSearch = async (query: string) => {
  const indexName = env.PINECONE_DENSE_INDEX_NAME;
  const index = pc.Index(indexName);

  const { result } = await index.searchRecords({
    query: {
      inputs: { text: query },
      topK: 3,
    },
    rerank: {
      model: 'bge-reranker-v2-m3',
      topN: 3,
      rankFields: ['chunkText'],
    },
    fields: ['chunkText'],
  });

  return result.hits.map((match) => ({
    id: match._id,
    score: match._score,
    metadata: match.fields,
  }));
};

export const runLexicalSearch = async (query: string) => {
  const indexName = env.PINECONE_SPARSE_INDEX_NAME;
  const index = pc.Index(indexName);

  const { result } = await index.searchRecords({
    query: {
      inputs: { text: query },
      topK: 3,
    },
    fields: ['chunkText'],
  });

  return result.hits.map((match) => ({
    id: match._id,
    score: match._score,
    metadata: match.fields,
  }));
};

export const runHybridSearch = async (query: string) => {
  const [result1, result2] = await Promise.all([
    runSemanticSearch(query),
    runLexicalSearch(query),
  ]);
  return chain(result1)
    .concat(result2)
    .unionBy((x) => x.id)
    .sortBy((x) => x.score)
    .reverse()
    .take(3)
    .value();
};
