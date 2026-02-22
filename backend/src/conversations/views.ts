import { Router, Request } from "express";
import conversationControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";

const conversationRouter = Router();

/**
 * POST /api/conversations - Create new conversation
 */
conversationRouter.post("/", async (req, res) => {
  try {
    const { studentId, practitionerId } = req.body;

    if (!studentId || !practitionerId) {
      res.status(400).send(errorJson("studentId and practitionerId required"));
      return;
    }

    const conversation = await conversationControllers.insertConversation(
      new mongoose.Types.ObjectId(studentId),
      new mongoose.Types.ObjectId(practitionerId)
    );

    res.status(201).send(successJson(conversation));
  } catch (error) {
    res.status(400).send(errorJson("Failed to create conversation"));
  }
});

/**
 * GET /api/conversations - Get user's conversations (filter by studentId or practitionerId)
 */
conversationRouter.get("/", async (req, res) => {
  try {
    const { studentId, practitionerId } = req.query;

    if (studentId) {
      const id = new mongoose.Types.ObjectId(studentId as string);
      const conversations = await conversationControllers.getConversationByStudentId(id);
      res.status(200).send(successJson(conversations));
      return;
    }

    if (practitionerId) {
      const id = new mongoose.Types.ObjectId(practitionerId as string);
      const conversations =
        await conversationControllers.getConversationByPractitionerId(id);
      res.status(200).send(successJson(conversations));
      return;
    }

    res.status(400).send(errorJson("studentId or practitionerId required"));
  } catch (error) {
    res.status(400).send(errorJson("Invalid student or practitioner ID"));
  }
});

/**
 * GET /api/conversations/:id - Get conversation by ID
 */
conversationRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const conversation = await conversationControllers.getConversationById(id);

    if (conversation) {
      res.status(200).send(successJson(conversation));
    } else {
      res.status(404).send(errorJson("Conversation not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid conversation ID"));
  }
});

export default conversationRouter;