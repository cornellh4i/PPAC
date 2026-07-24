import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import providerControllers from "./controllers";
import { verifyToken } from "../middleware/authMiddleware";
import { isAllowedAdminEmail } from "../auth/adminAllowlist";
import { successJson, errorJson } from "../utils/jsonResponses";

const providerRouter = Router();

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

const isValidAvailability = (value: unknown): value is { day: string; time: string }[] =>
  Array.isArray(value) &&
  value.every((slot) => typeof slot?.day === "string" && typeof slot?.time === "string");

const isValidInsurance = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

providerRouter.get("/", async (_req, res) => {
  try {
    const providers = await providerControllers.getProviders();
    res.status(200).send(successJson(providers));
  } catch (error) {
    res.status(400).send(errorJson("Failed to fetch providers"));
  }
});

providerRouter.post("/", verifyToken, requireAdmin, async (req: Request, res) => {
  const { name, field, location, number, about, experience, rating, avatar, bookingLink, order } = req.body;
  const availability = req.body.availability ?? [];
  const insurance = req.body.insurance ?? [];

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).send(errorJson("Name is required"));
    return;
  }
  if (!field || typeof field !== "string" || !field.trim()) {
    res.status(400).send(errorJson("Field is required"));
    return;
  }
  if (!location || typeof location !== "string" || !location.trim()) {
    res.status(400).send(errorJson("Location is required"));
    return;
  }
  if (!number || typeof number !== "string" || !number.trim()) {
    res.status(400).send(errorJson("Phone number is required"));
    return;
  }
  if (!about || typeof about !== "string" || !about.trim()) {
    res.status(400).send(errorJson("About is required"));
    return;
  }
  if (!experience || typeof experience !== "string" || !experience.trim()) {
    res.status(400).send(errorJson("Experience is required"));
    return;
  }
  if (!bookingLink || typeof bookingLink !== "string" || !bookingLink.trim()) {
    res.status(400).send(errorJson("Booking link is required"));
    return;
  }
  if (avatar !== undefined && avatar !== "female" && avatar !== "male") {
    res.status(400).send(errorJson("avatar must be 'female' or 'male'"));
    return;
  }
  if (!isValidAvailability(availability)) {
    res.status(400).send(errorJson("availability must be an array of {day, time}"));
    return;
  }
  if (!isValidInsurance(insurance)) {
    res.status(400).send(errorJson("insurance must be an array of strings"));
    return;
  }

  try {
    const provider = await providerControllers.addProvider({
      name: name.trim(),
      field: field.trim(),
      location: location.trim(),
      number: number.trim(),
      about: about.trim(),
      experience: experience.trim(),
      rating: rating !== undefined && rating !== "" ? Number(rating) : undefined,
      availability,
      insurance,
      avatar,
      bookingLink: bookingLink.trim(),
      order: order ? Number(order) : 0,
    } as any);
    res.status(201).send(successJson(provider));
  } catch (error) {
    res.status(400).send(errorJson("Failed to create provider"));
  }
});

providerRouter.put("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const existing = await providerControllers.getProviderById(id);
    if (!existing) {
      res.status(404).send(errorJson("Provider not found"));
      return;
    }

    const {
      name,
      field,
      location,
      number,
      about,
      experience,
      rating,
      avatar,
      bookingLink,
      availability,
      insurance,
      order,
    } = req.body;

    if (avatar !== undefined && avatar !== "female" && avatar !== "male" && avatar !== null) {
      res.status(400).send(errorJson("avatar must be 'female' or 'male'"));
      return;
    }
    if (
      bookingLink !== undefined &&
      (typeof bookingLink !== "string" || !bookingLink.trim())
    ) {
      res.status(400).send(errorJson("Booking link must be a non-empty string"));
      return;
    }
    if (availability !== undefined && !isValidAvailability(availability)) {
      res.status(400).send(errorJson("availability must be an array of {day, time}"));
      return;
    }
    if (insurance !== undefined && !isValidInsurance(insurance)) {
      res.status(400).send(errorJson("insurance must be an array of strings"));
      return;
    }

    const updatedFields: Record<string, unknown> = {};
    if (name !== undefined) updatedFields.name = name.trim();
    if (field !== undefined) updatedFields.field = field.trim();
    if (location !== undefined) updatedFields.location = location.trim();
    if (number !== undefined) updatedFields.number = number.trim();
    if (about !== undefined) updatedFields.about = about.trim();
    if (experience !== undefined) updatedFields.experience = experience.trim();
    if (rating !== undefined) updatedFields.rating = rating === "" ? undefined : Number(rating);
    if (avatar !== undefined) updatedFields.avatar = avatar ?? undefined;
    if (bookingLink !== undefined) updatedFields.bookingLink = bookingLink.trim();
    if (availability !== undefined) updatedFields.availability = availability;
    if (insurance !== undefined) updatedFields.insurance = insurance;
    if (order !== undefined) updatedFields.order = Number(order);

    const updated = await providerControllers.updateProvider(id, updatedFields);
    res.status(200).send(successJson(updated));
  } catch (error) {
    res.status(400).send(errorJson("Failed to update provider"));
  }
});

providerRouter.delete("/:id", verifyToken, requireAdmin, async (req: Request<{ id: string }>, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const result = await providerControllers.deleteProviderById(id);
    if (result.deletedCount > 0) {
      res.status(200).send(successJson(result));
    } else {
      res.status(404).send(errorJson("Provider not found"));
    }
  } catch (error) {
    res.status(400).send(errorJson("Failure to delete provider"));
  }
});

export default providerRouter;
