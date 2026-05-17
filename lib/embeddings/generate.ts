/**
 * Generate a 384-dimensional embedding for the given text.
 *
 * Priority:
 * 1. HuggingFace Inference API (if HUGGINGFACE_API_KEY is set)
 * 2. Deterministic hash-based pseudo-embedding (always works, no API needed)
 *
 * For production semantic search quality, set HUGGINGFACE_API_KEY in Vercel env vars.
 * Free HF key: https://huggingface.co/settings/tokens
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const DIMS = 384;
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  // ── Option 1: HuggingFace API (best quality) ──────────────────────────────
  if (hfKey) {
    try {
      const res = await fetch(
        'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${hfKey}`,
          },
          body: JSON.stringify({ inputs: text.slice(0, 512) }),
        }
      );

      if (res.ok) {
        const json = await res.json() as number[] | number[][];
        const embedding = Array.isArray(json[0]) ? (json as number[][])[0] : (json as number[]);
        if (embedding.length === DIMS) return embedding;
      }
    } catch {
      // Fall through to hash embedding
    }
  }

  // ── Option 2: Deterministic hash pseudo-embedding (always works) ───────────
  // Creates a stable 384-dim vector from the text content using a simple
  // hash function. Semantic search quality is reduced but items always save.
  return deterministicEmbedding(text, DIMS);
}

/**
 * Generate a deterministic pseudo-embedding from text using a hash function.
 * Not semantically meaningful but stable and always available.
 */
function deterministicEmbedding(text: string, dims: number): number[] {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const vector = new Float32Array(dims);

  // Seed each dimension using hash of (text + dimension index)
  for (let d = 0; d < dims; d++) {
    let hash = d * 2654435761;
    for (let i = 0; i < normalized.length; i++) {
      hash = Math.imul(hash ^ normalized.charCodeAt(i), 2246822519);
      hash = Math.imul(hash ^ (hash >>> 13), 3266489917);
    }
    // Normalize to [-1, 1]
    vector[d] = ((hash >>> 0) / 0xffffffff) * 2 - 1;
  }

  // L2-normalize the vector
  let norm = 0;
  for (let d = 0; d < dims; d++) norm += vector[d] * vector[d];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let d = 0; d < dims; d++) vector[d] /= norm;
  }

  return Array.from(vector);
}
