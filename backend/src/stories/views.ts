import { Router, Request } from "express";
import mongoose from "mongoose";

import storyControllers from "./controllers";
import { errorJson, successJson } from "../utils/jsonResponses";

const storyRouter = Router();

storyRouter.post("/", async (req, res) => {
  const { story, name, isAnonymous } = req.body;

  if (!story || typeof story !== "string" || !story.trim()) {
    res.status(400).send(errorJson("Story text is required"));
    return;
  }

  if (typeof isAnonymous !== "boolean") {
    res.status(400).send(errorJson("isAnonymous must be a boolean"));
    return;
  }

  if (!isAnonymous && (!name || typeof name !== "string" || !name.trim())) {
    res.status(400).send(errorJson("Name is required unless the story is anonymous"));
    return;
  }

  try {
    const newStory = await storyControllers.insertStory({
      story: story.trim(),
      name: isAnonymous ? null : name.trim(),
      isAnonymous,
    });
    res.status(201).send(successJson(newStory));
  } catch (error) {
    res.status(400).send(errorJson((error as Error).message));
  }
});

storyRouter.get("/", async (_req, res) => {
  try {
    const stories = await storyControllers.getStories();
    res.status(200).send(successJson(stories));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch stories"));
  }
});

storyRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const story = await storyControllers.getStoryById(id);

    if (!story) {
      res.status(404).send(errorJson("Story not found"));
      return;
    }

    res.status(200).send(successJson(story));
  } catch (error) {
    res.status(400).send(errorJson("Invalid story ID"));
  }
});

storyRouter.put("/:id", async (req: Request<{ id: string }>, res) => {
  const { story, name, isAnonymous } = req.body;

  if (story !== undefined && (typeof story !== "string" || !story.trim())) {
    res.status(400).send(errorJson("Story text must be a non-empty string"));
    return;
  }

  if (isAnonymous !== undefined && typeof isAnonymous !== "boolean") {
    res.status(400).send(errorJson("isAnonymous must be a boolean"));
    return;
  }

  if (
    isAnonymous === false &&
    name !== undefined &&
    (typeof name !== "string" || !name.trim())
  ) {
    res.status(400).send(errorJson("Name must be a non-empty string"));
    return;
  }

  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const updatedStory = await storyControllers.updateStory(id, {
      ...(story !== undefined ? { story: story.trim() } : {}),
      ...(name !== undefined
        ? { name: name ? name.trim() : null }
        : {}),
      ...(isAnonymous !== undefined
        ? {
            isAnonymous,
            ...(isAnonymous ? { name: null } : {}),
          }
        : {}),
    });

    if (!updatedStory) {
      res.status(404).send(errorJson("Story not found"));
      return;
    }

    res.status(200).send(successJson(updatedStory));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update story"));
  }
});

storyRouter.delete("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const deletedStory = await storyControllers.deleteStory(id);

    if (!deletedStory) {
      res.status(404).send(errorJson("Story not found"));
      return;
    }

    res.status(200).send(successJson({ deleted: true }));
  } catch (error) {
    res.status(400).send(errorJson("Failed to delete story"));
  }
});

export default storyRouter;
