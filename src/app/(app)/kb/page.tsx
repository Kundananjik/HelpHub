import Link from "next/link";
import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookIcon, PlusIcon } from "@/components/icons";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAuth();
  const staff = isStaff(session.user.role);
  const { q } = await searchParams;

  const articles = await prisma.article.findMany({
    where: {
      // Employees only see published, everyone-visible articles.
      // Staff see everything, including drafts and staff-only articles.
      ...(staff ? {} : { published: true, visibility: "EVERYONE" }),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      published: true,
      visibility: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description={
          staff
            ? "All articles, including staff-only guides and drafts."
            : "Guides and answers to common IT questions."
        }
        action={
          staff ? (
            <Link href="/kb/new">
              <Button>
                <PlusIcon className="h-4 w-4" /> New article
              </Button>
            </Link>
          ) : undefined
        }
      />

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search articles…"
          className="block w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </form>

      {articles.length === 0 ? (
        <EmptyState
          icon={<BookIcon />}
          title="No articles yet"
          description={
            staff
              ? "Create your first knowledge base article to help users self-serve."
              : "Check back soon for helpful guides."
          }
          action={
            staff ? (
              <Link href="/kb/new">
                <Button>
                  <PlusIcon className="h-4 w-4" /> New article
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {articles.map((a) => (
            <Link key={a.id} href={`/kb/${a.slug}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  {a.category && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      {a.category}
                    </span>
                  )}
                  {!a.published && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      Draft
                    </span>
                  )}
                  {a.visibility === "STAFF" && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                      Staff only
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                  {a.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {a.author?.name ?? "HelpHub"} · {timeAgo(a.updatedAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
