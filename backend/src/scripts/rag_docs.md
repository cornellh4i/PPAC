# RAG Chatbot — How It Works

This doc explains the chatbot system I built for PPAC. The goal was to make the chatbot actually useful by grounding its answers in real resources and events from our database, instead of just making things up.

---

## The Basic Idea

Normal chatbots just use an AI model and hope it knows the right answer. RAG (Retrieval-Augmented Generation) is different — before the AI responds, we first search our own database for relevant content and hand it to the AI as context. So the AI is answering based on *our* data, not general internet knowledge.

The flow looks like this:

```
User sends message
      ↓
Convert message to embedding (a list of numbers that represent meaning)
      ↓
Search MongoDB for chunks with similar embeddings
      ↓
Take the top matches and pass them into the GPT prompt
      ↓
GPT responds using only that context
```

---

## The Pipeline

### Step 1 — Ingest (`src/scripts/ingestResources.ts`)

This script connects to MongoDB and pulls all resources and published events. It combines the useful text fields (title, description, type, tags, etc.) into one string per document, then splits those strings into smaller chunks (500 characters with 50 character overlap). The overlap helps make sure we don't cut off a sentence right at a chunk boundary and lose context.

All chunks get saved to a `chunks.json` file.

### Step 2 — Embed (`src/scripts/generateEmbeddings.ts`)

This script reads `chunks.json` and sends each chunk to OpenAI's `text-embedding-3-small` model, which converts the text into a 1536-dimensional vector (basically a list of 1536 numbers that encode the meaning of the text). Those vectors get stored in a MongoDB collection called `resourceembeddings`.

### Step 3 — Search (`src/services/vectorSearch.ts`)

When a user sends a message, we embed their query the same way. Then we run a MongoDB Atlas Vector Search to find the stored chunks whose embeddings are closest to the query embedding. Cosine similarity is used to measure closeness. Any result below a score of 0.50 gets filtered out so we don't return totally unrelated content.

### Step 4 — Respond (`src/services/chatbot.ts`)

The top matching chunks get formatted and injected into the GPT system prompt. GPT then answers based only on what we gave it, and always includes titles and links so the user can find the original source.

---

## MongoDB Schema

Embeddings are stored in the `resourceembeddings` collection. Each document looks like:

```json
{
  "text": "the raw chunk text",
  "embedding": [0.012, -0.034, ...],
  "metadata": {
    "sourceUrl": "https://...",
    "title": "Resource or Event Title",
    "resourceId": "original MongoDB _id",
    "type": "website / podcast / book / video / ppac / partner / campus",
    "tags": ["tag1", "tag2"],
    "chunkIndex": 0
  }
}
```

The `embedding` field is what Atlas searches against. The `metadata` is what gets passed to GPT to construct the answer.

---

## Environment Variables

Both of these need to be in `backend/.env`:

```
MONGODB_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openai_api_key
```

Ask Grace for the new OpenAI API Key

---

## Atlas Vector Search Index

This only needs to be set up once in MongoDB Atlas. The index lives on the `resourceembeddings` collection and is named `vector_index`. It tells Atlas how to search the `embedding` field.

If it ever needs to be recreated:
1. Go to Atlas → your cluster → Search Indexes
2. Create a new Vector Search index on `Dev > resourceembeddings`
3. Name it `vector_index`, use the JSON editor, paste:

```json
{
  "fields": [{
    "type": "vector",
    "path": "embedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

---

## How to Rebuild Embeddings

Run this any time resources or events are added or changed:

```bash
cd backend
yarn rebuild-embeddings
```

This runs both scripts in order — ingest then embed. It wipes the old embeddings first so there are no duplicates.

To just wipe without rebuilding:

```bash
yarn clear-embeddings
```

---

## File Map

```
backend/src/
├── scripts/
│   ├── ingestResources.ts       pulls from MongoDB, chunks text, saves chunks.json
│   ├── generateEmbeddings.ts    embeds chunks via OpenAI, stores in MongoDB
│   └── clearEmbeddings.ts       wipes the resourceembeddings collection
├── services/
│   ├── vectorSearch.ts          takes a query, returns similar chunks above threshold
│   └── chatbot.ts               POST /api/chat — runs search, builds prompt, calls GPT
```

---

## Tuning

If the bot keeps saying "no resources found" for things that should match, lower the threshold in `vectorSearch.ts`:

```typescript
const SIMILARITY_THRESHOLD = 0.50; // go lower if too strict, higher if too noisy
```