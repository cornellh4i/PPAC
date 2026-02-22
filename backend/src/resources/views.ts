import { Router, Request } from "express";
import resourceControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";

const resourceRouter = Router();

resourceRouter.get("/", async (req, res) => {
  try {
    res.status(200).send(await resourceControllers.getResources());
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch resources"));
  }
});

resourceRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const resource = await resourceControllers.getResourceById(id);
    if(resource.length > 0){
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
  }
});


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
      res.status(404).send(errorJson("Failure to delete user"));
    }
  } catch (error) {
    res.status(400).send(errorJson(error));
  }
});

export default resourceRouter;