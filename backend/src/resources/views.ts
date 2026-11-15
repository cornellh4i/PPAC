import { Router, Request } from "express";
import resourceControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware";
import { isHttpUrl } from "../utils/validation";

// Returns an error message if any provided link is not a full http(s) URL.
const checkResourceLinks = (body: any): string | null => {
  if (body.link !== undefined && !isHttpUrl(body.link)) {
    return "Link must be a full URL starting with http:// or https://";
  }
  for (const field of ["readAt", "borrowAt"]) {
    const links = body[field];
    if (links === undefined) continue;
    if (!Array.isArray(links)) return `${field} must be an array`;
    for (const item of links) {
      if (!isHttpUrl(item?.url)) return `Every "${field}" link must be a full URL starting with http:// or https://`;
    }
  }
  return null;
};

const resourceRouter = Router();

resourceRouter.get("/", async (req, res) => {
  const queryType = req.query.type as string | undefined;
  const filter: { type?: "website" | "podcast" | "book" | "local resource" | "informational" } = {};
  if (queryType) {
    filter["type"] = queryType as "website" | "podcast" | "book" | "local resource" | "informational";
  }
  try {
    const resource = await resourceControllers.getResources(filter);
    res.status(200).send(successJson(resource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch resources"));
  }
});

resourceRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if (resource) {
      res.status(200).send(successJson(resource));
    } else {
      res.status(404).send(errorJson("Resource not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid resource ID"));
  }
});

resourceRouter.put("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if (!resource) {
      res.status(404).send(errorJson("Resource not found"));
      return;
    }
    const linkError = checkResourceLinks(req.body);
    if (linkError) {
      res.status(400).send(errorJson(linkError));
      return;
    }
    const updatedResource = await resourceControllers.updateResource(id, req.body);
    res.status(200).send(successJson(updatedResource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update resource"));
  }
});

resourceRouter.delete("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if (!resource) {
      res.status(404).send(errorJson("Resource not found"));
      return;
    }
    const result = await resourceControllers.deleteResourceById(id);
    if (result.deletedCount > 0) {
      res.status(200).send(successJson(result));
    } else {
      res.status(404).send(errorJson("Failure to delete resource"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Failure to delete resource"));
  }
});

resourceRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { title, type, description, link, file, createdBy, tags, readAt, borrowAt, status } = req.body;
  if (!title || !type || !description || !link || !createdBy) {
    res.status(400).send(errorJson("Missing a required field"));
    return;
  }
  const linkError = checkResourceLinks(req.body);
  if (linkError) {
    res.status(400).send(errorJson(linkError));
    return;
  }
  try {
    const resource = await resourceControllers.addResource({
      title,
      type,
      description,
      link,
      file,
      tags: tags ?? [],
      readAt: readAt ?? [],
      borrowAt: borrowAt ?? [],
      createdBy,
      status: status ?? 'published',
    });
    res.status(201).send(successJson(resource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to create resource"));
  }
});

export default resourceRouter;