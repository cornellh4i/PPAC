import { dbConnect } from "../database";
import { ResourceModel } from "../resources/models";
import { EventModel } from "../events/models";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface TextChunk {
  text: string;
  metadata: {
    sourceUrl: string;
    title: string;
    resourceId: string;
    type: string;
    tags: string[];
    chunkIndex: number;
  };
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(
  text: string,
  metadata: Omit<TextChunk["metadata"], "chunkIndex">
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push({
      text: text.slice(start, end),
      metadata: { ...metadata, chunkIndex: chunks.length },
    });
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function ingest() {
  await dbConnect();
  const resources = await ResourceModel.find({});
  console.log(`Found ${resources.length} resources`);

  const allChunks: TextChunk[] = [];

  for (const resource of resources) {
    // Combine all useful text fields into one string for embedding
    const fullText = [
      resource.title,
      resource.description,
      resource.type,
      resource.tags.join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const chunks = chunkText(fullText, {
      sourceUrl: resource.link,
      title: resource.title,
      resourceId: resource._id.toString(),
      type: resource.type,
      tags: resource.tags,
    });

    allChunks.push(...chunks);
  }

  const events = await EventModel.find({ isPublished: true });
  console.log(`Found ${events.length} events`);

  for (const event of events) {
    const fullText = [
      event.title,
      event.description,
      event.eventType,
      event.tags.join(", "),
      `Location: ${event.location.venue} (${event.location.type})`,
      `Organizer: ${event.organizer.name} from ${event.organizer.organization}`,
      `Start: ${event.startTime.toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const chunks = chunkText(fullText, {
      sourceUrl: event.location.link ?? "",
      title: event.title,
      resourceId: event._id.toString(),
      type: event.eventType,
      tags: event.tags,
    });

    allChunks.push(...chunks);
  }

  const outputPath = path.join(__dirname, "../../chunks.json");
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));
  console.log(`Saved ${allChunks.length} chunks to chunks.json`);
  process.exit(0);
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
