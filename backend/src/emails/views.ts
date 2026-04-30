import { Router, Request } from "express";
import { errorJson, successJson } from "../utils/jsonResponses";
import { sendContactEmail } from "./controller";

interface EmailRequestBody {
  name: string;
  email: string;
  message: string;
}

const emailRouter = Router();

emailRouter.post(
  "/",
  async (req: Request<Record<string, never>, unknown, EmailRequestBody>, res) => {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).send(errorJson("name, email, and message are required"));
      return;
    }

    if (!email.includes("@")) {
      res.status(400).send(errorJson("Invalid email address"));
      return;
    }

    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      res.status(200).send(successJson("Email sent"));
    } catch (error) {
      res.status(500).send(errorJson("Failed to send email"));
    }
  }
);

export default emailRouter;
