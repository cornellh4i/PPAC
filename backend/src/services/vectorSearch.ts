import OpenAI from "openai";
import mongoose from "mongoose";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EmbeddingModel =
  mongoose.models.ResourceEmbedding ||
  mongoose.model(
    "ResourceEmbedding",
    new mongoose.Schema({
      text: String,
      embedding: [Number],
      metadata: {
        sourceUrl: String,
        title: String,
        resourceId: String,
        type: String,
        tags: [String],
        chunkIndex: Number,
      },
    })
  );

const SIMILARITY_THRESHOLD = 0.5;

export async function searchSimilarChunks(query: string, topK = 5) {
    
  const embeddingRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = embeddingRes.data[0].embedding;

  const results = await (EmbeddingModel.aggregate as any)([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: queryEmbedding,
      numCandidates: 50,
      limit: topK,
    },
  },
  {
    $project: {
      text: 1,
      metadata: 1,
      score: { $meta: "vectorSearchScore" },
    },
  },
]);

  const filtered = results.filter((r: any) => r.score >= SIMILARITY_THRESHOLD);
  console.log(
    `Vector search: ${results.length} results, ${filtered.length} above threshold`
  );
  return filtered;
}