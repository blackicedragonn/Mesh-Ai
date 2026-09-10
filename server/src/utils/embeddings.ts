import { getClient } from './openai-client.js';

const EMBEDDING_MODEL = 'Qwen/Qwen3-Embedding-8B';

export const createEmbedding = async (text: string): Promise<number[]> => {
  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0]!.embedding;
};
