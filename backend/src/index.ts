import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { errorJson } from "./utils/jsonResponses";
import userRouter from "./users/views";
import authRouter from "./auth/views"
import resourceRouter from "./resources/views";
import eventRouter from "./events/views";
import emailRouter from "./emails/views";
import chatbotRouter from "./services/chatbot";
import storyRouter from "./stories/views";
import communityRouter from "./community/views";
import testimonialRouter from "./testimonials/views";
import faqRouter from "./faq/views";
import presidentsLetterRouter from "./presidentsLetter/views";
import teamMemberRouter from "./team-members/views";
import providerRouter from "./providers/views";
import swaggerUI from "swagger-ui-express";
import spec from "../api-spec.json";
import { dbConnect } from "./database";
import cors from "cors";
import mongoose from 'mongoose';

const app = express();

// Behind a hosting proxy or load balancer, req.ip would be the proxy's address
// for every visitor, so per-IP limits (e.g. the contact form) would be shared by
// everyone. Trust one proxy hop by default; set TRUST_PROXY=0 if the server is
// reached directly with no proxy in front of it.
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

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
apiRouter.use("/events", eventRouter);
apiRouter.use("/stories", storyRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/testimonials", testimonialRouter);
apiRouter.use("/faq", faqRouter);
apiRouter.use("/presidents-letter", presidentsLetterRouter);
apiRouter.use("/team-members", teamMemberRouter);
apiRouter.use("/providers", providerRouter);
apiRouter.use("/email", emailRouter);
apiRouter.use("/chat", chatbotRouter);

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

// Last-resort error handler: always answer with JSON and never leak stack
// traces. Upload problems (wrong file type, file too large) become 400s.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.message;
    res.status(400).send(errorJson(message));
    return;
  }
  const status = Number(err?.status ?? err?.statusCode);
  if (status >= 400 && status < 500) {
    res.status(status).send(errorJson(err.expose === false ? "Bad request" : err.message));
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).send(errorJson("Server error"));
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
