import FormData from "form-data";
import Mailgun from "mailgun.js";

interface ContactEmailInput {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  message,
}: ContactEmailInput) {
  const domain = process.env.MG_SANDBOX_DOMAIN;
  const key =
    process.env.MG_API_KEY || process.env.MG_SENDING_KEY || "";
  const baseUrl = process.env.MG_BASE_URL;

  if (!domain || !key) {
    throw new Error("Missing MG_SANDBOX_DOMAIN or MG_API_KEY (or MG_SENDING_KEY)");
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key,
    ...(baseUrl ? { url: baseUrl } : {}),
  });

  return mg.messages.create(domain, {
    from: `Mailgun Sandbox <postmaster@${domain}>`,
    to: ["PPAC <ppac.cornell@gmail.com>"],
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
  });
}
