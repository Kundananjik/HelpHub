"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { SpinnerIcon } from "@/components/icons";
import type { Status } from "@prisma/client";

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onMouseEnter={() => onChange && setHover(n)}
            onMouseLeave={() => onChange && setHover(0)}
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={onChange ? "cursor-pointer" : "cursor-default"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={active ? "#f59e0b" : "none"}
              stroke={active ? "#f59e0b" : "#cbd5e1"}
              strokeWidth="2"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function SatisfactionRating({
  ticketId,
  status,
  isOwner,
  rating,
  comment,
  isStaff,
}: {
  ticketId: string;
  status: Status;
  isOwner: boolean;
  rating: number | null;
  comment: string | null;
  isStaff: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(rating ?? 0);
  const [text, setText] = useState(comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rateable =
    isOwner && (status === "RESOLVED" || status === "CLOSED") && !rating;

  // Nothing to show: not rated, not rateable, and not staff viewing.
  if (!rating && !rateable) return null;

  async function submit() {
    if (!value) {
      setError("Please select a rating.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: value, comment: text }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not submit rating.");
      return;
    }
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Satisfaction" />
      <div className="space-y-3 p-5">
        {rating ? (
          <>
            <div className="flex items-center gap-2">
              <Stars value={rating} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {rating}/5
              </span>
            </div>
            {comment && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                “{comment}”
              </p>
            )}
            {!isOwner && isStaff && (
              <p className="text-xs text-slate-400">
                Rating submitted by the requester.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              How satisfied are you with the resolution?
            </p>
            <Stars value={value} onChange={setValue} />
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Optional feedback…"
              className="min-h-[70px]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button size="sm" onClick={submit} disabled={saving}>
              {saving && <SpinnerIcon className="h-4 w-4" />}
              Submit rating
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
