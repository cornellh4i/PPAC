import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** TEMPORARY CODE, REPLACE THIS WITH THE ACTUAL CHATBOT FUNCTIONALITY */
const response = openai.responses.create({
  model: "gpt-5.4-mini",
  input: "write a haiku about ai",
  store: true,
});

response.then((result) => console.log(result.output_text));