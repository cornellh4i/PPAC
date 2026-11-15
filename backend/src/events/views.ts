import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import eventControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { successJson, errorJson } from "../utils/jsonResponses";

const eventRouter = Router();

// Returns an error message if the time range is invalid, otherwise null.
const checkTimeRange = (start: unknown, end: unknown): string | null => {
  const startDate = new Date(start as string);
  const endDate = new Date(end as string);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "Invalid start or end time";
  if (endDate < startDate) return "End time must be after the start time";
  return null;
};

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

eventRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { title, eventType, startTime, endTime, location, organizer } = req.body;
  if (!title || !eventType || !startTime || !endTime || !location || !organizer) {
    return res.status(400).send(errorJson("Missing required fields"));
  }
  const rangeError = checkTimeRange(startTime, endTime);
  if (rangeError) return res.status(400).send(errorJson(rangeError));
  try {
    const event = await eventControllers.insertEvent(req.body);
    res.status(201).send(successJson(event));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

const buildEventFilter = (query: Request["query"]): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (query.eventType) filter.eventType = query.eventType;
  if (query.startDate) filter.startTime = { $gte: new Date(query.startDate as string) };
  if (query.endDate) filter.endTime = { $lte: new Date(query.endDate as string) };
  return filter;
};

// Public list: only published events visible to the public. Drafts and
// PPAC-only events are never returned here, whatever the query string says.
eventRouter.get("/", async (req, res) => {
  const filter = { ...buildEventFilter(req.query), isPublished: true, visibility: "public" };
  try {
    const events = await eventControllers.getEvents(filter);
    res.status(200).send(successJson(events));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

// Admin list: every event, with optional visibility/isPublished filters.
eventRouter.get("/admin", verifyToken, requireAdmin, async (req, res) => {
  const filter = buildEventFilter(req.query);
  if (req.query.visibility) filter.visibility = req.query.visibility;
  if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === "true";
  try {
    const events = await eventControllers.getEvents(filter);
    res.status(200).send(successJson(events));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

eventRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const event = await eventControllers.getEventById(id);
    if (event && event.isPublished && event.visibility === "public") {
      res.status(200).send(successJson(event));
    } else {
      res.status(404).send(errorJson("Event not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid event ID"));
  }
});

eventRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      if (req.body.startTime !== undefined || req.body.endTime !== undefined) {
        const existing = await eventControllers.getEventById(id);
        if (!existing) {
          res.status(404).send(errorJson("Event not found"));
          return;
        }
        const rangeError = checkTimeRange(
          req.body.startTime ?? existing.startTime,
          req.body.endTime ?? existing.endTime,
        );
        if (rangeError) {
          res.status(400).send(errorJson(rangeError));
          return;
        }
      }
      const updated = await eventControllers.updateEvent(id, req.body);
      if (!updated) {
        res.status(404).send(errorJson("Event not found"));
        return;
      }
      res.status(200).send(successJson(updated));
    } catch (error) {
      res.status(400).send(errorJson("Failed to update event"));
    }
  }
);

eventRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request<{ id: string }>, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const deleted = await eventControllers.deleteEvent(id);
      if (!deleted) {
        res.status(404).send(errorJson("Event not found"));
        return;
      }
      res.status(200).send(successJson({ deleted: true }));
    } catch (error) {
      res.status(400).send(errorJson("Failed to delete event"));
    }
  }
);

export default eventRouter;
