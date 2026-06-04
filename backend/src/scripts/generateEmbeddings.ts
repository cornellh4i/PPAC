import OpenAI from "openai";
import mongoose from "mongoose";
import { dbConnect } from "../database";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddingSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, required: true },
});

export const EmbeddingModel =
  mongoose.models.ResourceEmbedding ||
  mongoose.model("ResourceEmbedding", embeddingSchema);

const BATCH_SIZE = 20;

async function generateEmbeddings() {
  await dbConnect();

  const chunksPath = path.join(__dirname, "../../chunks.json");
  if (!fs.existsSync(chunksPath)) {
    console.error("chunks.json not found — run ingestResources.ts first");
    process.exit(1);
  }

  const chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));
  console.log(`Generating embeddings for ${chunks.length} chunks...`);

  // Clear old embeddings before rebuilding
  await EmbeddingModel.deleteMany({});
  console.log("Cleared old embeddings");

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c: any) => c.text);

    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    const docs = batch.map((chunk: any, j: number) => ({
      text: chunk.text,
      embedding: response.data[j].embedding,
      metadata: chunk.metadata,
    }));

    await EmbeddingModel.insertMany(docs);
    console.log(`Embedded chunks ${i + 1}–${i + batch.length}`);
  }

  console.log("🎉 All embeddings generated and stored!");
  process.exit(0);
}

generateEmbeddings().catch((err) => {
  console.error("Embedding generation failed:", err);
  process.exit(1);
});
