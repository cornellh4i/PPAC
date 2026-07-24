import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import mongoose from "mongoose";
import teamMemberControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { successJson, errorJson } from "../utils/jsonResponses";

const teamMemberRouter = Router();

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

teamMemberRouter.get("/", async (req, res) => {
  const queryCategory = req.query.category as string | undefined;
  const filter: { category?: "officer" | "speaker" } = {};
  if (queryCategory === "officer" || queryCategory === "speaker") {
    filter.category = queryCategory;
  }
  try {
    const members = await teamMemberControllers.getTeamMembers(filter);
    res.status(200).send(successJson(members));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch team members"));
  }
});

teamMemberRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (
    req: Request<{}, {}, { name?: string; role?: string; category?: string; linkedinUrl?: string; order?: string }>,
    res
  ) => {
    const { name, role, category, linkedinUrl, order } = req.body;
    if (!name || !name.trim()) {
      res.status(400).send(errorJson("Name is required"));
      return;
    }
    if (!role || !role.trim()) {
      res.status(400).send(errorJson("Role is required"));
      return;
    }
    if (category !== "officer" && category !== "speaker") {
      res.status(400).send(errorJson("A valid category ('officer' or 'speaker') is required"));
      return;
    }
    try {
      let imageUrl: string | undefined;
      let cloudinaryPublicId: string | undefined;
      if (req.file) {
        const uploaded = await teamMemberControllers.uploadImageBuffer(req.file.buffer);
        imageUrl = uploaded.url;
        cloudinaryPublicId = uploaded.publicId;
      }
      const member = await teamMemberControllers.addTeamMember({
        name: name.trim(),
        role: role.trim(),
        category,
        imageUrl,
        cloudinaryPublicId,
        linkedinUrl: linkedinUrl?.trim() || undefined,
        order: order ? Number(order) : 0,
      } as any);
      res.status(201).send(successJson(member));
    } catch (error) {
      res.status(400).send(errorJson("Failed to create team member"));
    }
  }
);

teamMemberRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (
    req: Request<{ id: string }, {}, { name?: string; role?: string; category?: string; linkedinUrl?: string; order?: string }>,
    res
  ) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const existing = await teamMemberControllers.getTeamMemberById(id);
      if (!existing) {
        res.status(404).send(errorJson("Team member not found"));
        return;
      }

      const { name, role, category, linkedinUrl, order } = req.body;
      if (category !== undefined && category !== "officer" && category !== "speaker") {
        res.status(400).send(errorJson("category must be 'officer' or 'speaker'"));
        return;
      }

      const updatedFields: Record<string, unknown> = {};
      if (name !== undefined) updatedFields.name = name.trim();
      if (role !== undefined) updatedFields.role = role.trim();
      if (category !== undefined) updatedFields.category = category;
      if (linkedinUrl !== undefined) updatedFields.linkedinUrl = linkedinUrl.trim() || undefined;
      if (order !== undefined) updatedFields.order = Number(order);

      if (req.file) {
        const uploaded = await teamMemberControllers.uploadImageBuffer(req.file.buffer);
        if (existing.cloudinaryPublicId) {
          await teamMemberControllers.deleteImage(existing.cloudinaryPublicId);
        }
        updatedFields.imageUrl = uploaded.url;
        updatedFields.cloudinaryPublicId = uploaded.publicId;
      }

      const updated = await teamMemberControllers.updateTeamMember(id, updatedFields);
      res.status(200).send(successJson(updated));
    } catch (error) {
      res.status(400).send(errorJson("Failed to update team member"));
    }
  }
);

teamMemberRouter.delete("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const existing = await teamMemberControllers.getTeamMemberById(id);
    if (!existing) {
      res.status(404).send(errorJson("Team member not found"));
      return;
    }
    if (existing.cloudinaryPublicId) {
      await teamMemberControllers.deleteImage(existing.cloudinaryPublicId);
    }
    const result = await teamMemberControllers.deleteTeamMemberById(id);
    if (result.deletedCount > 0) {
      res.status(200).send(successJson(result));
    } else {
      res.status(404).send(errorJson("Failure to delete team member"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Failure to delete team member"));
  }
});

export default teamMemberRouter;
