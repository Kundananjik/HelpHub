import { requireRole } from "@/lib/guards";
import { PageHeader } from "@/components/app/PageHeader";
import { ArticleForm } from "../ArticleForm";

export default async function NewArticlePage() {
  await requireRole("TECHNICIAN", "ADMIN");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New article"
        description="Write a knowledge base article."
      />
      <ArticleForm />
    </div>
  );
}
