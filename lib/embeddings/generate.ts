/**
 * Generate a 768-dimensional embedding via Jina AI's free embedding API.
 * API key optional for low volume; set JINA_API_KEY env var for higher limits.
 * Falls back to a zero-vector if the API is unavailable — context item is saved
 * but won't surface in semantic search until re-embedded.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const DIMS = 768;
  const jinaKey = process.env.JINA_API_KEY ?? '';

  try {
    const res = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jinaKey ? { Authorization: `Bearer ${jinaKey}` } : {}),
      },
      body: JSON.stringify({
        model: 'jina-embeddings-v2-base-en',
        input: [text.slice(0, 8192)], // Jina token limit
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[embeddings] Jina API error:', err);
      return new Array(DIMS).fill(0);
    }

    const json = await res.json() as { data: { embedding: number[] }[] };
    return json.data[0].embedding;
  } catch (err) {
    console.error('[embeddings] Failed to generate embedding:', err);
    return new Array(DIMS).fill(0);
  }
}
