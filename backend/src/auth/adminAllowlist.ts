export const allowedAdminEmails = ['glm86@cornell.edu'];

export const isAllowedAdminEmail = (email?: string | null): boolean => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  return allowedAdminEmails.includes(normalizedEmail);
};
