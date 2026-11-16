import FormData from "form-data";
import Mailgun from "mailgun.js";

// Labels match the "Type of submission" dropdown on the Home page.
export const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  question: "General question",
  request: "Request",
  event: "Event inquiry",
  partnership: "Partnership or collaboration",
  other: "Other",
};

interface ContactEmailInput {
  name: string;
  email: string;
  message: string;
  submissionType?: string;
}

export async function sendContactEmail({
  name,
  email,
  message,
  submissionType,
}: ContactEmailInput) {
  const domain = process.env.MG_SANDBOX_DOMAIN;
  const key =
    process.env.MG_API_KEY || process.env.MG_SENDING_KEY || "";
  const baseUrl = process.env.MG_BASE_URL;
  const to = process.env.CONTACT_TO_EMAIL || "ppac.cornell@gmail.com";

  if (!domain || !key) {
    throw new Error("Missing MG_SANDBOX_DOMAIN or MG_API_KEY (or MG_SENDING_KEY)");
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key,
    ...(baseUrl ? { url: baseUrl } : {}),
  });

  const typeLabel = submissionType ? SUBMISSION_TYPE_LABELS[submissionType] : undefined;

  return mg.messages.create(domain, {
    from: `PPAC Website <postmaster@${domain}>`,
    to: [`PPAC <${to}>`],
    // Lets PPAC hit "Reply" and answer the visitor directly.
    "h:Reply-To": `${name.replace(/["<>\r\n]/g, "")} <${email}>`,
    subject: typeLabel
      ? `New Contact Form Submission: ${typeLabel}`
      : "New Contact Form Submission",
    text:
      `Name: ${name}\nEmail: ${email}\n` +
      (typeLabel ? `Type: ${typeLabel}\n` : "") +
      `Message:\n${message}`,
  });
}
