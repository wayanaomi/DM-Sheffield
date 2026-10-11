/**
 * Minimal transactional email boundary (NOT-1). No SMTP provider is
 * configured in this environment, so messages are logged to the server
 * console in development. Wire a real provider (e.g. SMTP via nodemailer,
 * or a transactional API) by implementing `send` here — the call sites
 * elsewhere in the app do not need to change.
 */
interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!smtpConfigured) {
    console.log(
      `[dev email transport — no SMTP configured]\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`
    );
    return;
  }
  // Real SMTP sending would be implemented here once SMTP_* env vars are supplied.
  throw new Error("SMTP is configured but a real transport is not yet implemented.");
}
