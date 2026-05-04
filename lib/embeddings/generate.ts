import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

// Singleton — model loads once per server process
let embedder: FeatureExtractionPipeline | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

/**
 * Generate a 384-dimensional embedding vector for the given text.
 * Uses all-MiniLM-L6-v2 locally via Transformers.js (no API calls).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}
