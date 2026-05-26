import OpenAI from "openai";
import { Router } from "express";
import { successJson, errorJson } from "../utils/jsonResponses";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatbotRouter = Router();

chatbotRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    const systemPrompt = ``;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    res.status(200).send(successJson({ reply: response.output_text }));
  } catch (error) {
    console.error("Chat error:", error);
    res.status(400).send(errorJson("Failed to get response"));
  }
});

export default chatbotRouter;
