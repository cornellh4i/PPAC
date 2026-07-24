import { AdminEmailModel } from "./models";

const DEFAULT_ADMIN_EMAIL = "glm86@cornell.edu";

const normalizeEmail = (email?: string | null): string | undefined =>
  email?.trim().toLowerCase() || undefined;

export const getAllowedAdminEmails = async (): Promise<string[]> => {
  const count = await AdminEmailModel.countDocuments();
  if (count === 0) {
    await AdminEmailModel.create({ email: DEFAULT_ADMIN_EMAIL });
  }
  const docs = await AdminEmailModel.find().sort({ createdAt: 1 });
  return docs.map((doc) => doc.email);
};

export const isAllowedAdminEmail = async (email?: string | null): Promise<boolean> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }
  const allowedEmails = await getAllowedAdminEmails();
  return allowedEmails.includes(normalizedEmail);
};

export const addAllowedAdminEmail = async (email?: string | null): Promise<string[]> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("A valid email is required");
  }
  await AdminEmailModel.updateOne(
    { email: normalizedEmail },
    { $setOnInsert: { email: normalizedEmail } },
    { upsert: true }
  );
  return getAllowedAdminEmails();
};

export const removeAllowedAdminEmail = async (email?: string | null): Promise<string[]> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("A valid email is required");
  }
  const allowedEmails = await getAllowedAdminEmails();
  if (allowedEmails.length <= 1 && allowedEmails.includes(normalizedEmail)) {
    throw new Error("Cannot remove the last remaining admin email");
  }
  await AdminEmailModel.deleteOne({ email: normalizedEmail });
  return getAllowedAdminEmails();
};
