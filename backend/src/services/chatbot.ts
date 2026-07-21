import OpenAI from "openai";
import { Router } from "express";
import { successJson, errorJson } from "../utils/jsonResponses";
import { searchSimilarChunks } from "./vectorSearch";
import {
  buildRetrievedContext,
  buildSystemPrompt,
  getGuardrailReply,
} from "./chatbotPolicy";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatbotRouter = Router();

chatbotRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content ??
      "";

    const earlyGuardrailReply = getGuardrailReply(lastUserMessage, true);
    if (earlyGuardrailReply) {
      res.status(200).send(successJson({ reply: earlyGuardrailReply }));
      return;
    }

    const relevantChunks = await searchSimilarChunks(lastUserMessage);
    const postRetrievalGuardrailReply = getGuardrailReply(
      lastUserMessage,
      relevantChunks.length > 0
    );
    if (postRetrievalGuardrailReply) {
      res.status(200).send(successJson({ reply: postRetrievalGuardrailReply }));
      return;
    }

    const context = buildRetrievedContext(relevantChunks);
    const systemPrompt = buildSystemPrompt(context);

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
