import "server-only";
import { env } from "@/lib/env";

export type StoredAttachment = {
  filename: string;
  contentType: string;
  data: string; // either a hosted URL (blob) or a base64 data URL (fallback)
};

/**
 * Persists an uploaded attachment. When a Vercel Blob token is configured the
 * file is uploaded to object storage and a public URL is returned; otherwise it
 * falls back to storing the base64 data URL inline (suitable for demos).
 */
export async function storeAttachment(file: {
  filename: string;
  contentType: string;
  dataUrl: string;
}): Promise<StoredAttachment> {
  if (env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const base64 = file.dataUrl.includes(",")
      ? file.dataUrl.slice(file.dataUrl.indexOf(",") + 1)
      : file.dataUrl;
    const buffer = Buffer.from(base64, "base64");
    const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`attachments/${Date.now()}-${safeName}`, buffer, {
      access: "public",
      contentType: file.contentType,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      filename: file.filename,
      contentType: file.contentType,
      data: blob.url,
    };
  }

  return {
    filename: file.filename,
    contentType: file.contentType,
    data: file.dataUrl,
  };
}
