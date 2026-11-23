import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { supabase } from "@/integrations/supabase/client";
import legacy from "@/lib/legacy-redirects.json";

const PAGES = legacy.pages as Record<string, string>;
const OLD_POSTS = new Set(legacy.posts as string[]);

/**
 * Old WordPress URLs land here when the host has no server-side 301 (public/_redirects).
 * Old blog posts go to /blog/<same-slug> once that post is republished, else to the matching service page.
 */
function useLegacyTarget(pathname: string) {
  const key = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const slug = key.replace(/^\/|\/$/g, "");
  const mapped = PAGES[key];
  const [target, setTarget] = useState<string | null | undefined>(OLD_POSTS.has(slug) ? undefined : mapped ?? null);

  useEffect(() => {
    if (!OLD_POSTS.has(slug)) return;
    let live = true;
    const fallback = () => live && setTarget(mapped ?? null);
    const timer = setTimeout(fallback, 3000);
    Promise.resolve(supabase.from("posts").select("slug").eq("slug", slug).maybeSingle()).then(
      ({ data }) => {
        clearTimeout(timer);
        if (live) setTarget(data ? `/blog/${slug}` : mapped ?? null);
      },
      () => {
        clearTimeout(timer);
        fallback();
      },
    );
    return () => {
      live = false;
    };
  }, [slug, mapped]);

  return target;
}

export default function NotFound() {
  const { pathname } = useLocation();
  const target = useLegacyTarget(pathname);
  if (target) return <Navigate to={target} replace />;
  if (target === undefined) return null;
  return (
    <div className="container flex flex-col items-start gap-4 py-28">
      <Seo title="Page not found" />
      <h1 className="font-display text-5xl font-black uppercase">Page not found</h1>
      <p className="text-bone-muted">That page moved or no longer exists.</p>
      <Link to="/" className="font-semibold text-brand-text no-underline">Back to home →</Link>
    </div>
  );
}
