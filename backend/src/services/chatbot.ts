import OpenAI from "openai";
import { Router } from "express";
import { successJson, errorJson } from "../utils/jsonResponses";
import { searchSimilarChunks } from "./vectorSearch";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatbotRouter = Router();

chatbotRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    // Get the most recent user message to search against
    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content ??
      "";

    // Retrieve relevant resource chunks
    const relevantChunks = await searchSimilarChunks(lastUserMessage);

    const context =
      relevantChunks.length > 0
        ? relevantChunks
            .map(
              (c: any) =>
                `Title: ${c.metadata.title}\nType: ${c.metadata.type}\nLink: ${c.metadata.sourceUrl}\nContent: ${c.text}`
            )
            .join("\n\n---\n\n")
        : "No closely matching resources were found.";

    const systemPrompt = `You are a helpful assistant for PPAC, a women's health organization.
Answer the user's question using the resources and events provided below.
Always include the title and link/location when referencing something.
If the provided context doesn't answer the question, say so honestly.

CONTEXT:
${context}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const reply =
      response.choices[0].message.content ?? "No response generated.";
    res.status(200).send(successJson({ reply }));
  } catch (error) {
    console.error("Chat error:", error);
    res.status(400).send(errorJson("Failed to get response"));
  }
});

export default chatbotRouter;
