import { Router, Request } from "express";
import mongoose from "mongoose";
import eventControllers from "./controllers";
import { successJson, errorJson } from "../utils/jsonResponses";

const eventRouter = Router();

eventRouter.post("/", async (req, res) => {
  const { title, eventType, startTime, endTime, location, organizer, createdBy } = req.body;
  if (!title || !eventType || !startTime || !endTime || !location || !organizer || !createdBy) {
    return res.status(400).send(errorJson("Missing required fields"));
  }
  try {
    const event = await eventControllers.insertEvent(req.body);
    res.status(201).send(successJson(event));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

eventRouter.get("/", async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.eventType) filter.eventType = req.query.eventType;
  if (req.query.visibility) filter.visibility = req.query.visibility;
  if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === "true";
  if (req.query.startDate) filter.startTime = { $gte: new Date(req.query.startDate as string) };
  if (req.query.endDate) filter.endTime = { $lte: new Date(req.query.endDate as string) };
  try {
    const events = await eventControllers.getEvents();
    res.status(200).send(successJson(events));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

eventRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const event = await eventControllers.getEventById(id);
    if (event) {
      res.status(200).send(successJson(event));
    } else {
      res.status(404).send(errorJson("Event not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid event ID"));
  }
});

eventRouter.put("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const updated = await eventControllers.updateEvent(id, req.body);
    if (!updated) {
      res.status(404).send(errorJson("Event not found"));
      return;
    }
    res.status(200).send(successJson(updated));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update event"));
  }
});

eventRouter.delete("/:id", async (req: Request<{ id: string }>, res) => {
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
});

export default eventRouter;
