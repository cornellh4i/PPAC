import express from "express";
import bodyParser from "body-parser";
import userRouter from "./users/views";
import authRouter from "./auth/views"
import resourceRouter from "./resources/views";
import swaggerUI from "swagger-ui-express";
import spec from "../api-spec.json";
import { dbConnect } from "./database";
import cors from "cors";
import mongoose from 'mongoose';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',  // Only allow your frontend
  credentials: true  // If you're using cookies/auth
}));

// Middleware to parse json request bodies
app.use(bodyParser.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(spec));

const apiRouter = express.Router();

/**
 * Sub-routers for our main router, we should have one sub-router per "entity" in the application
 */
apiRouter.use("/users", userRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/resources", resourceRouter);

app.use("/api", apiRouter)

/**
 * Some dummy routes to illustrate express syntax
 */
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  res.send(req.body);
});

app.listen(process.env.PORT || 8000, async () => {
  console.log("✅ Server is up and running");
  try {
    await dbConnect();
    console.log("MongoDB connection state:", mongoose.connection.readyState); // Should be 1
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});
