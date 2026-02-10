import { Router } from "express";

const userRouter = Router();

userRouter.post("/", (req, res) => {
  res.send(req.body);
});

export default userRouter;
