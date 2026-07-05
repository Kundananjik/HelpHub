import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { ArticleActions } from "./ArticleActions";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireAuth();
  const { slug } = await params;
  const staff = isStaff(session.user.role);

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  if (!article) notFound();
  // Employees can't see drafts or staff-only articles.
  if (!staff && (!article.published || article.visibility === "STAFF")) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/kb"
        className="mb-4 inline-flex text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        ← Back to Knowledge Base
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {article.category && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  {article.category}
                </span>
              )}
              {staff && article.visibility === "STAFF" && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                  Staff only
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {article.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {article.author?.name ?? "HelpHub"} ·{" "}
              {formatDate(article.updatedAt)}
              {!article.published && " · Draft"}
            </p>
          </div>
          {staff && (
            <ArticleActions articleId={article.id} slug={article.slug} />
          )}
        </div>

        <div className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {article.body}
        </div>
      </Card>
    </div>
  );
}
