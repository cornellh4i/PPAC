import { Router, Request } from "express";
import userControllers from "./controllers";
import mongoose from "mongoose";
import { successJson, errorJson } from "../utils/jsonResponses";



const userRouter = Router();

userRouter.get("/", async (req, res) => {
  try {
    res.status(200).send(await userControllers.getUsers());
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch users"));
  }
});

userRouter.get("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const user = await userControllers.getUserById(id);
    if(user.length > 0){
      res.status(200).send(successJson(user));
    } else {
      res.status(404).send(errorJson("User not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Invalid user ID"));
  }
});

userRouter.put("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const user = await userControllers.getUserById(id);
    if (!user) {
      res.status(404).send(errorJson("User not found"));
      return;
    }
    const updatedUser = await userControllers.updateUser(id, req.body);
    res.status(200).send(successJson(updatedUser));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update user"));
  }
});

userRouter.delete("/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const user = await userControllers.getUserById(id);
    if (!user || user.length === 0) {
      res.status(404).send(errorJson("User not found"));
      return;
    }
    const result = await userControllers.deleteUserById(id);
    if (result.deletedCount > 0) {
      res.status(200).send(successJson(result));
    } else {
      res.status(404).send(errorJson("Failure to delete user"));
    }
  } catch (error) {
    res.status(400).send(errorJson(error));
  }
});
export default userRouter;
