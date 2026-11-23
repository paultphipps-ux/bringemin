import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { ConsultForm } from "@/components/site/ConsultForm";
import { useCategories, usePost, useSiteSettings } from "@/hooks/useContent";
import { formatDate, safeHtml } from "@/lib/utils";
import NotFound from "./NotFound";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = usePost(slug);
  const { data: categories = [] } = useCategories();
  const s = useSiteSettings();
  if (isLoading) return <div className="container py-24 text-bone-dim">Loading…</div>;
  if (!post) return <NotFound />;
  const category = categories.find((c) => c.id === post.category_id);

  return (
    <>
      <Seo
        type="article"
        title={post.seo_title ?? post.title}
        description={post.seo_description ?? post.excerpt}
        image={post.og_image_url ?? post.cover_image_url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          image: post.cover_image_url ?? undefined,
          publisher: { "@type": "Organization", name: s.business_name },
        }}
      />
      <article className="container max-w-3xl py-16">
        <Link to={category ? `/blog/category/${category.slug}` : "/blog"} className="text-sm font-semibold uppercase tracking-wider text-brand-text no-underline">
          {category?.name ?? "Blog"}
        </Link>
        <h1 className="mt-3 font-display text-[clamp(32px,4.6vw,50px)] font-extrabold tracking-tight leading-tight">{post.title}</h1>
        <p className="mt-3 text-bone-dim">{formatDate(post.published_at)}</p>
        {post.cover_image_url && <img src={post.cover_image_url} alt="" className="mt-8 w-full rounded-xl object-cover" />}
        <div className="prose prose-invert prose-lg mt-10 max-w-none prose-a:text-brand-text prose-headings:font-display" dangerouslySetInnerHTML={safeHtml(post.body)} />
      </article>
      <section className="border-t border-ink-line bg-ink-2">
        <div className="container grid max-w-5xl gap-10 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold uppercase tracking-tight">Need help with a case like this?</h2>
            <p className="mt-3 text-bone-muted">Free, confidential consultation with a licensed investigator.</p>
          </div>
          <ConsultForm />
        </div>
      </section>
    </>
  );
}
