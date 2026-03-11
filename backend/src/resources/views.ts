import { Router, Request } from "express";
import resourceControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";

const resourceRouter = Router();

resourceRouter.get("/", async (req, res) => {
  const queryType = req.query.type as string | undefined;
  const filter: { type?: "website" | "podcast" | "book" | "video" } = {};
  if (queryType) {
    filter["type"] = queryType as "website" | "podcast" | "book" | "video";
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
    if(resource){
      res.status(200).send(successJson(resource));
    } else {
      res.status(404).send(errorJson("Resource not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid resource ID"));
  }
});

resourceRouter.put("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if (!resource) {
      res.status(404).send(errorJson("Resource not found"));
      return;
    }
    const updatedResource = await resourceControllers.updateResource(id, req.body);
    res.status(200).send(successJson(updatedResource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update resource"));
  }})


resourceRouter.delete("/:id", async (req: Request<{ id: string }>, res) => {
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
})

resourceRouter.post("/", async (req, res) => {
  const { title, type, description, link, file, createdBy } = req.body;
  if (!title || !type || !description || !link || !createdBy) {
    res.status(400).send(errorJson("Missing a required field"));
    return;
  }
  try {
    const resource = await resourceControllers.addResource({ title, type, description, link, file, createdBy});
    res.status(201).send(successJson(resource));
  } catch (error) {
    res.status(400).send(errorJson("Failed to create resource"));
  }
});



export default resourceRouter;