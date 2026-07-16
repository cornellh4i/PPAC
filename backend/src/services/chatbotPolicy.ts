type RetrievedChunk = {
  text: string;
  metadata?: {
    title?: string;
    type?: string;
    sourceUrl?: string;
  };
  score?: number;
};

export type QueryIntent =
  | "safe_to_answer"
  | "diagnosis"
  | "medication"
  | "emergency"
  | "unrelated";

const DIAGNOSIS_PATTERN =
  /\b(do i have|am i suffering from|is this|could this be|diagnose|diagnosis|what condition do i have|do i need medical attention)\b/i;
const MEDICATION_PATTERN =
  /\b(what medication|which medication|should i take|what should i take|prescribe|dosage|dose|ibuprofen|advil|tylenol|acetaminophen|naproxen|birth control|painkiller|drug recommendation)\b/i;
const EMERGENCY_PATTERN =
  /\b(emergency|urgent|severe pain|passing out|fainted|can't breathe|cannot breathe|heavy bleeding|suicidal|self-harm)\b/i;
const UNRELATED_PATTERN =
  /\b(weather|temperature|sports|stock price|bitcoin|movie times|celebrity|homework|math problem|programming bug|recipe|restaurant)\b/i;

export function classifyQueryIntent(query: string): QueryIntent {
  const trimmed = query.trim();
  if (!trimmed) {
    return "unrelated";
  }

  if (EMERGENCY_PATTERN.test(trimmed)) {
    return "emergency";
  }

  if (DIAGNOSIS_PATTERN.test(trimmed)) {
    return "diagnosis";
  }

  if (MEDICATION_PATTERN.test(trimmed)) {
    return "medication";
  }

  if (UNRELATED_PATTERN.test(trimmed)) {
    return "unrelated";
  }

  return "safe_to_answer";
}

export function buildRetrievedContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const title = chunk.metadata?.title || "Untitled resource";
      const type = chunk.metadata?.type || "resource";
      const sourceUrl = chunk.metadata?.sourceUrl || "No link available";
      const score =
        typeof chunk.score === "number" ? chunk.score.toFixed(3) : "N/A";

      return [
        `Resource ${index + 1}:`,
        `Title: ${title}`,
        `Type: ${type}`,
        `Link: ${sourceUrl}`,
        `Match Score: ${score}`,
        `Excerpt: ${chunk.text}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

export function buildSystemPrompt(context: string): string {
  return `You are the PPAC resource chatbot. Answer only with the retrieved PPAC resources and events provided in CONTEXT.

Rules:
1. Use only the supplied CONTEXT. Do not use outside knowledge or guess.
2. If the CONTEXT is missing, weak, or does not answer the question, say you cannot answer from the available PPAC resources.
3. Do not provide medical advice, diagnosis, treatment plans, or medication recommendations.
4. Refuse questions about diagnosis, whether someone has a condition, medication choices, dosages, or other personalized medical guidance.
5. Refuse unrelated questions that are not about PPAC resources, PPAC events, contact/help information, or pelvic pain support resources in the provided CONTEXT.
6. When you do answer, cite the relevant resource title and link in Markdown format, for example: [Resource Title](https://example.com).
7. If the best help is to send the user directly to a page, do that plainly.
8. Keep answers concise and factual. Do not hallucinate details.

If refusing, briefly explain that you can only help with PPAC resources and cannot provide medical advice.

CONTEXT:
${context}`;
}

export function getGuardrailReply(
  query: string,
  hasRelevantContext: boolean
): string | null {
  const intent = classifyQueryIntent(query);

  if (intent === "emergency") {
    return "I can't help with emergencies or urgent medical situations. Please seek immediate help from a licensed clinician or emergency services. I can still help you find PPAC resources once you're safe.";
  }

  if (intent === "diagnosis") {
    return "I can't tell you whether you have a medical condition or provide a diagnosis. I can help you find PPAC resources about pelvic pain and related support, but a licensed clinician is the right person for diagnosis.";
  }

  if (intent === "medication") {
    return "I can't recommend medications, dosages, or treatment plans. I can help you find PPAC resources and educational materials, but medication advice should come from a licensed clinician.";
  }

  if (intent === "unrelated") {
    return "I can only help with PPAC resources, PPAC events, and pelvic pain support information. I can't answer unrelated questions.";
  }

  if (!hasRelevantContext) {
    return "I couldn't find enough relevant PPAC information to answer that from the available resources. Please try asking about PPAC resources, events, pelvic pain support, or contact information.";
  }

  return null;
}
