import { Link, useParams, useSearchParams } from "react-router-dom";
import { Hero, Section } from "@/components/site/blocks";
import { Seo } from "@/components/site/Seo";
import { useCategories, usePosts } from "@/hooks/useContent";
import { cn, formatDate } from "@/lib/utils";

export default function Blog() {
  const { category: catSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page") ?? 1) - 1);
  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.slug === catSlug);
  const { data, isLoading } = usePosts({ categoryId: category?.id, page });
  const posts = data?.posts ?? [];
  const pages = data ? Math.ceil(data.total / data.pageSize) : 1;
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <>
      <Seo title={category ? `${category.name} articles` : "Blog"} description="Articles from licensed Dallas private investigators on bail recovery, family cases, legal matters and protecting your business." />
      <Hero fallback={{ eyebrow: "Blog", heading: category ? category.name : "Insights from the field" }} />
      <Section>
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <Link to="/blog" className={cn("rounded-full border px-4 py-2 text-sm no-underline", !catSlug ? "border-brand bg-brand text-white" : "border-ink-edge")}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/blog/category/${c.slug}`} className={cn("rounded-full border px-4 py-2 text-sm no-underline", c.slug === catSlug ? "border-brand bg-brand text-white" : "border-ink-edge")}>
              {c.name}
            </Link>
          ))}
        </nav>
        {isLoading ? (
          <p className="text-bone-dim">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-bone-dim">No articles yet. Check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-ink-edge bg-ink-3 no-underline">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
                ) : (
                  <div className="aspect-[16/9] w-full bg-[#1E1E22]" />
                )}
                <div className="flex flex-col gap-2 p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-text">{catName(p.category_id)}</span>
                  <span className="font-display text-2xl font-semibold text-bone group-hover:text-brand-text">{p.title}</span>
                  {p.excerpt && <span className="text-[15px] text-bone-muted">{p.excerpt}</span>}
                  <span className="text-sm text-bone-dim">{formatDate(p.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setParams({ page: String(i + 1) })}
                aria-current={i === page ? "page" : undefined}
                className={cn("h-11 min-w-11 rounded-md border px-3", i === page ? "border-brand bg-brand text-white" : "border-ink-edge")}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        )}
      </Section>
    </>
  );
}
