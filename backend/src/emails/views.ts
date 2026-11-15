import { Router, Request } from "express";
import { errorJson, successJson } from "../utils/jsonResponses";
import { sendContactEmail, SUBMISSION_TYPE_LABELS } from "./controller";

interface EmailRequestBody {
  name: string;
  email: string;
  message: string;
  submissionType?: string;
}

// Same rule as the Home page form: something@something.tld, no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: at most MAX_PER_WINDOW sends per IP per window.
// Resets when the server restarts, which is fine for spam protection. If the
// app runs behind a proxy, enable `app.set("trust proxy", 1)` so req.ip is the
// visitor's address.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentSends = new Map<string, number[]>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const sends = (recentSends.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (sends.length >= MAX_PER_WINDOW) {
    recentSends.set(ip, sends);
    return true;
  }
  sends.push(now);
  recentSends.set(ip, sends);
  return false;
};

const emailRouter = Router();

emailRouter.post(
  "/",
  async (req: Request<Record<string, never>, unknown, EmailRequestBody>, res) => {
    const { name, email, message, submissionType } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).send(errorJson("name, email, and message are required"));
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      res.status(400).send(errorJson("Invalid email address"));
      return;
    }

    if (submissionType !== undefined && !(submissionType in SUBMISSION_TYPE_LABELS)) {
      res.status(400).send(errorJson("Invalid submission type"));
      return;
    }

    if (isRateLimited(req.ip ?? "unknown")) {
      res
        .status(429)
        .send(errorJson("Too many messages. Please try again in a few minutes."));
      return;
    }

    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        submissionType,
      });
      res.status(200).send(successJson("Email sent"));
    } catch (error) {
      console.error("Failed to send contact email:", error);
      res.status(500).send(errorJson("Failed to send email"));
    }
  }
);

export default emailRouter;
