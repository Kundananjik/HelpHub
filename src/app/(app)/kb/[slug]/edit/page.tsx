import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { ArticleForm } from "../../ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole("TECHNICIAN", "ADMIN");
  const { slug } = await params;

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit article" description={article.title} />
      <ArticleForm
        articleId={article.id}
        initial={{
          title: article.title,
          body: article.body,
          category: article.category,
          published: article.published,
        }}
      />
    </div>
  );
}
