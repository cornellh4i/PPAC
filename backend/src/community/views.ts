import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import mongoose from "mongoose";
import communityControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { successJson, errorJson } from "../utils/jsonResponses";

const communityRouter = Router();

const MAX_SCRAPBOOK_PHOTOS = 4;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).send(errorJson("Unauthorized"));
    return;
  }
  if (!(await isAllowedAdminEmail(req.user.email))) {
    res.status(403).send(errorJson("Forbidden"));
    return;
  }
  next();
};

communityRouter.get("/", async (req, res) => {
  const querySection = req.query.section as string | undefined;
  const filter: { section?: "hero" | "scrapbook" } = {};
  if (querySection === "hero" || querySection === "scrapbook") {
    filter.section = querySection;
  }
  try {
    const photos = await communityControllers.getCommunityPhotos(filter);
    res.status(200).send(successJson(photos));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch community photos"));
  }
});

communityRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (req: Request<{}, {}, { section?: string; caption?: string; date?: string; order?: string }>, res) => {
    const { section, caption, date, order } = req.body;
    if (!section || (section !== "hero" && section !== "scrapbook")) {
      res.status(400).send(errorJson("A valid section ('hero' or 'scrapbook') is required"));
      return;
    }
    if (!req.file) {
      res.status(400).send(errorJson("An image file is required"));
      return;
    }
    try {
      if (section === "scrapbook") {
        const existingScrapbookPhotos = await communityControllers.getCommunityPhotos({ section: "scrapbook" });
        if (existingScrapbookPhotos.length >= MAX_SCRAPBOOK_PHOTOS) {
          res.status(400).send(errorJson(`A maximum of ${MAX_SCRAPBOOK_PHOTOS} scrapbook photos is allowed`));
          return;
        }
      }
      const { url, publicId } = await communityControllers.uploadImageBuffer(req.file.buffer);
      const photo = await communityControllers.addCommunityPhoto({
        section,
        imageUrl: url,
        cloudinaryPublicId: publicId,
        caption,
        date,
        order: order ? Number(order) : 0,
      } as any);
      res.status(201).send(successJson(photo));
    } catch (error) {
      res.status(400).send(errorJson("Failed to upload community photo"));
    }
  }
);

communityRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (req: Request<{ id: string }, {}, { caption?: string; date?: string; order?: string }>, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const existing = await communityControllers.getCommunityPhotoById(id);
      if (!existing) {
        res.status(404).send(errorJson("Community photo not found"));
        return;
      }

      const updatedFields: Record<string, unknown> = {};
      if (req.body.caption !== undefined) updatedFields.caption = req.body.caption;
      if (req.body.date !== undefined) updatedFields.date = req.body.date;
      if (req.body.order !== undefined) updatedFields.order = Number(req.body.order);

      if (req.file) {
        const { url, publicId } = await communityControllers.uploadImageBuffer(req.file.buffer);
        await communityControllers.deleteImage(existing.cloudinaryPublicId);
        updatedFields.imageUrl = url;
        updatedFields.cloudinaryPublicId = publicId;
      }

      const updated = await communityControllers.updateCommunityPhoto(id, updatedFields);
      res.status(200).send(successJson(updated));
    } catch (error) {
      res.status(400).send(errorJson("Failed to update community photo"));
    }
  }
);

communityRouter.delete("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const existing = await communityControllers.getCommunityPhotoById(id);
    if (!existing) {
      res.status(404).send(errorJson("Community photo not found"));
      return;
    }
    await communityControllers.deleteImage(existing.cloudinaryPublicId);
    const result = await communityControllers.deleteCommunityPhotoById(id);
    if (result.deletedCount > 0) {
      res.status(200).send(successJson(result));
    } else {
      res.status(404).send(errorJson("Failure to delete community photo"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Failure to delete community photo"));
  }
});

export default communityRouter;
