import "server-only";
import { env, appUrl } from "@/lib/env";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Sends an email via Resend when `RESEND_API_KEY` is configured, otherwise logs
 * to the console so local/dev flows still work end-to-end without a provider.
 */
export async function sendEmail({ to, subject, html, text }: SendArgs) {
  const from = env.EMAIL_FROM ?? "HelpHub <onboarding@resend.dev>";

  if (!env.RESEND_API_KEY) {
    console.info(
      `\n[email:dev] To: ${to}\n[email:dev] Subject: ${subject}\n[email:dev] ${text ?? stripHtml(html)}\n`
    );
    return { delivered: false as const };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) {
      console.error("[email] Resend error:", await res.text());
      return { delivered: false as const };
    }
    return { delivered: true as const };
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return { delivered: false as const };
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function layout(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="color:#4f46e5">HelpHub</h2>
    <h3>${title}</h3>
    ${body}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="font-size:12px;color:#94a3b8">HelpHub — IT Service Desk</p>
  </div>`;
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your HelpHub password",
    html: layout(
      "Password reset requested",
      `<p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
       <p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
       <p style="font-size:12px;color:#64748b">If you didn't request this, you can safely ignore this email.</p>`
    ),
    text: `Reset your HelpHub password: ${resetUrl}`,
  };
}

export function ticketNotificationEmail(opts: {
  heading: string;
  ticketTitle: string;
  ticketNumber: string;
  body: string;
  ticketId: string;
}) {
  const url = `${appUrl}/tickets/${opts.ticketId}`;
  return {
    subject: `[${opts.ticketNumber}] ${opts.heading}`,
    html: layout(
      opts.heading,
      `<p><strong>${opts.ticketNumber}</strong> — ${opts.ticketTitle}</p>
       <p>${opts.body}</p>
       <p><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View ticket</a></p>`
    ),
    text: `${opts.heading}\n${opts.ticketNumber} — ${opts.ticketTitle}\n${opts.body}\n${url}`,
  };
}
