import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import testimonialControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { errorJson, successJson } from "../utils/jsonResponses";

const testimonialRouter = Router();

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

testimonialRouter.get("/", async (_req, res) => {
  try {
    const testimonials = await testimonialControllers.getTestimonials();
    res.status(200).send(successJson(testimonials));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch testimonials"));
  }
});

testimonialRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { quote, author, order } = req.body;

  if (!quote || typeof quote !== "string" || !quote.trim()) {
    res.status(400).send(errorJson("Quote is required"));
    return;
  }

  if (!author || typeof author !== "string" || !author.trim()) {
    res.status(400).send(errorJson("Author is required"));
    return;
  }

  try {
    const newTestimonial = await testimonialControllers.insertTestimonial({
      quote: quote.trim(),
      author: author.trim(),
      order: typeof order === "number" ? order : 0,
    });
    res.status(201).send(successJson(newTestimonial));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

testimonialRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    const { quote, author, order } = req.body;

    if (quote !== undefined && (typeof quote !== "string" || !quote.trim())) {
      res.status(400).send(errorJson("Quote must be a non-empty string"));
      return;
    }

    if (author !== undefined && (typeof author !== "string" || !author.trim())) {
      res.status(400).send(errorJson("Author must be a non-empty string"));
      return;
    }

    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const updated = await testimonialControllers.updateTestimonial(id, {
        ...(quote !== undefined ? { quote: quote.trim() } : {}),
        ...(author !== undefined ? { author: author.trim() } : {}),
        ...(order !== undefined ? { order } : {}),
      });

      if (!updated) {
        res.status(404).send(errorJson("Testimonial not found"));
        return;
      }

      res.status(200).send(successJson(updated));
    } catch (error) {
      res.status(400).send(errorJson("Failed to update testimonial"));
    }
  }
);

testimonialRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const deleted = await testimonialControllers.deleteTestimonial(id);

      if (!deleted) {
        res.status(404).send(errorJson("Testimonial not found"));
        return;
      }

      res.status(200).send(successJson({ deleted: true }));
    } catch (error) {
      res.status(400).send(errorJson("Failed to delete testimonial"));
    }
  }
);

export default testimonialRouter;
