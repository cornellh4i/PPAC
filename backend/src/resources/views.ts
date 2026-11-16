import { Router, Request } from "express";
import resourceControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware";
import { isHttpUrl } from "../utils/validation";

type ResourceType = "website" | "podcast" | "book" | "local resource" | "informational";

// Books can rely on their "Read online" / "Borrow" links, so their main link is optional.
const isLinkOptional = (type: unknown) => type === "book";

// Returns an error message if any provided link is not a full http(s) URL.
// `type` is the resource's type after the change (used to allow an empty book link).
const checkResourceLinks = (body: any, type: unknown): string | null => {
  const emptyLink = typeof body.link === "string" && body.link.trim() === "";
  if (body.link !== undefined && !(emptyLink && isLinkOptional(type)) && !isHttpUrl(body.link)) {
    return emptyLink
      ? "Link is required"
      : "Link must be a full URL starting with http:// or https://";
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

const typeFilter = (query: Request["query"]) =>
  typeof query.type === "string" && query.type ? { type: query.type as ResourceType } : {};

// Public list: drafts are left out. Older resources have no status and count as published.
resourceRouter.get("/", async (req, res) => {
  try {
    const resource = await resourceControllers.getResources({
      ...typeFilter(req.query),
      status: { $ne: "draft" },
    });
    res.status(200).send(successJson(resource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch resources"));
  }
});

// Admin list: includes drafts.
resourceRouter.get("/admin", verifyToken, requireAdmin, async (req, res) => {
  try {
    const resource = await resourceControllers.getResources(typeFilter(req.query));
    res.status(200).send(successJson(resource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch resources"));
  }
});

resourceRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if (resource && resource.status !== "draft") {
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
    const linkError = checkResourceLinks(req.body, req.body.type ?? resource.type);
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
  if (!title || !type || !description || (!link && !isLinkOptional(type)) || !createdBy) {
    res.status(400).send(errorJson("Missing a required field"));
    return;
  }
  const linkError = checkResourceLinks(req.body, type);
  if (linkError) {
    res.status(400).send(errorJson(linkError));
    return;
  }
  try {
    const resource = await resourceControllers.addResource({
      title,
      type,
      description,
      link: link ?? "",
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