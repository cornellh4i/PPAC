import OpenAI from "openai";
import { Router } from "express";
import { successJson, errorJson } from "../utils/jsonResponses";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatbotRouter = Router();

chatbotRouter.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: message,
    });
    res.status(200).send(successJson({ reply: response.output_text }));
  } catch (error) {
    res.status(400).send(errorJson("Failed to get response"));
  }
});

export default chatbotRouter;
