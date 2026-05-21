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

    const systemPrompt = `
You are a helpful assistant for a pelvic pain health club website.

Your ONLY goal is to help users find the correct page or resource on the website.

DO NOT:
- Answer general health or medical questions
- Provide diagnoses or advice

INSTEAD:
- Suggest relevant pages or actions on the site
- Be concise and clear

Pages you can route users to:
- Community Page: /community
- Events Page: /events
- Resources Page: /resources
- Contact Page: /contact
- Providers Page: /providers

If the question is outside your scope, respond with:
"I'm not sure, this question is beyond my scope. Try asking questions like, “I want resources on period cramps” or “I want to find PPAC events.”"
`;

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
