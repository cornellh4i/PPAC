import { Router, Request, Response, NextFunction } from "express";

import letterControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { errorJson, successJson } from "../utils/jsonResponses";

const presidentsLetterRouter = Router();

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

presidentsLetterRouter.get("/", async (_req, res) => {
  try {
    const letter = await letterControllers.getLetter();
    res.status(200).send(successJson(letter));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch presidents letter"));
  }
});

presidentsLetterRouter.put("/", verifyToken, requireAdmin, async (req, res) => {
  const { paragraphs, closing, signature } = req.body;

  if (
    paragraphs !== undefined &&
    (!Array.isArray(paragraphs) ||
      !paragraphs.every((p) => typeof p === "string"))
  ) {
    res.status(400).send(errorJson("paragraphs must be an array of strings"));
    return;
  }

  if (closing !== undefined && typeof closing !== "string") {
    res.status(400).send(errorJson("closing must be a string"));
    return;
  }

  if (signature !== undefined && typeof signature !== "string") {
    res.status(400).send(errorJson("signature must be a string"));
    return;
  }

  try {
    const updated = await letterControllers.updateLetter({
      ...(paragraphs !== undefined
        ? { paragraphs: paragraphs.map((p: string) => p.trim()).filter(Boolean) }
        : {}),
      ...(closing !== undefined ? { closing: closing.trim() } : {}),
      ...(signature !== undefined ? { signature: signature.trim() } : {}),
    });
    res.status(200).send(successJson(updated));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update presidents letter"));
  }
});

export default presidentsLetterRouter;
