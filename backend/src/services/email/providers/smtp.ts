import type { EmailPayload, EmailProvider } from '../provider.js';
import { config } from '../../../config/index.js';

export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';

  async send(payload: EmailPayload): Promise<void> {
    // @ts-ignore - nodemailer optional dependency (install when using SMTP)
    const nodemailer = await import('nodemailer');
    const { host, port, user, pass } = config.email.smtp;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
    await transporter.sendMail({
      from: config.email.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      html: payload.html,
    });
  }
}
