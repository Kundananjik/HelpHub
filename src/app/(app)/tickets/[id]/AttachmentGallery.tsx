"use client";

/* eslint-disable @next/next/no-img-element */
import { PaperclipIcon } from "@/components/icons";

type Attachment = {
  id: string;
  filename: string;
  contentType: string;
  data: string;
};

export function AttachmentGallery({
  attachments,
}: {
  attachments: Attachment[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attachments.map((a) => {
        const isImage = a.contentType.startsWith("image/");
        return (
          <a
            key={a.id}
            href={a.data}
            download={a.filename}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          >
            {isImage ? (
              <img
                src={a.data}
                alt={a.filename}
                className="h-28 w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-28 w-full items-center justify-center text-slate-400">
                <PaperclipIcon className="h-6 w-6" />
              </div>
            )}
            <div className="truncate border-t border-slate-200 px-2 py-1.5 text-xs text-slate-600">
              {a.filename}
            </div>
          </a>
        );
      })}
    </div>
  );
}
