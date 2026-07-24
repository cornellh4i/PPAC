import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import faqControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { errorJson, successJson } from "../utils/jsonResponses";

const faqRouter = Router();

const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).send(errorJson("Unauthorized"));
    return;
  }
  if (!(await isAllowedAdminEmail(req.user.email))) {
    res.status(403).send(errorJson("Forbidden"));
    return;
  }
  next();
};

faqRouter.get("/", async (_req, res) => {
  try {
    const faqItems = await faqControllers.getFaqItems();
    res.status(200).send(successJson(faqItems));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch FAQ items"));
  }
});

faqRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { question, answer, order } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    res.status(400).send(errorJson("Question is required"));
    return;
  }

  if (!answer || typeof answer !== "string" || !answer.trim()) {
    res.status(400).send(errorJson("Answer is required"));
    return;
  }

  try {
    const newFaqItem = await faqControllers.insertFaqItem({
      question: question.trim(),
      answer: answer.trim(),
      order: typeof order === "number" ? order : 0,
    });
    res.status(201).send(successJson(newFaqItem));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

faqRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    const { question, answer, order } = req.body;

    if (question !== undefined && (typeof question !== "string" || !question.trim())) {
      res.status(400).send(errorJson("Question must be a non-empty string"));
      return;
    }

    if (answer !== undefined && (typeof answer !== "string" || !answer.trim())) {
      res.status(400).send(errorJson("Answer must be a non-empty string"));
      return;
    }

    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const updated = await faqControllers.updateFaqItem(id, {
        ...(question !== undefined ? { question: question.trim() } : {}),
        ...(answer !== undefined ? { answer: answer.trim() } : {}),
        ...(order !== undefined ? { order } : {}),
      });

      if (!updated) {
        res.status(404).send(errorJson("FAQ item not found"));
        return;
      }

      res.status(200).send(successJson(updated));
    } catch (error) {
      res.status(400).send(errorJson("Failed to update FAQ item"));
    }
  }
);

faqRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const deleted = await faqControllers.deleteFaqItem(id);

      if (!deleted) {
        res.status(404).send(errorJson("FAQ item not found"));
        return;
      }

      res.status(200).send(successJson({ deleted: true }));
    } catch (error) {
      res.status(400).send(errorJson("Failed to delete FAQ item"));
    }
  }
);

export default faqRouter;
