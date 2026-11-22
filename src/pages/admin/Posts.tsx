import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/integrations/supabase/types";
import { StatusPill } from "@/components/admin/StatusSelect";
import { useCategories } from "@/hooks/useContent";
import { formatDate } from "@/lib/utils";
import { AdminHeader } from "./AdminLayout";

const TABS = ["all", "published", "scheduled", "draft"] as const;

export default function Posts() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "all") as (typeof TABS)[number];
  const search = params.get("q") ?? "";
  const { data: categories = [] } = useCategories();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin", "posts", status, search],
    queryFn: async () => {
      let q = supabase.from("posts").select("id,title,slug,status,published_at,updated_at,category_id").order("updated_at", { ascending: false }).limit(500);
      if (status !== "all") q = q.eq("status", status);
      if (search) q = q.ilike("title", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as Pick<Post, "id" | "title" | "slug" | "status" | "published_at" | "updated_at" | "category_id">[];
    },
  });

  return (
    <>
      <AdminHeader
        title="Blog posts"
        subtitle="Write, schedule and publish articles on the blog."
        actions={<Link to="/admin/posts/new" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 font-semibold text-white no-underline"><Plus size={16} aria-hidden /> New post</Link>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-[#E9E9E6] p-1" role="tablist" aria-label="Filter posts">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={status === t} onClick={() => setParams({ status: t, q: search })} className={`min-h-9 rounded-md px-3 text-sm capitalize ${status === t ? "bg-white font-semibold" : "text-[#45454C]"}`}>{t}</button>
          ))}
        </div>
        <label className="flex-1 basis-60">
          <span className="sr-only">Search posts</span>
          <input type="search" placeholder="Search posts" defaultValue={search} onKeyDown={(e) => e.key === "Enter" && setParams({ status, q: (e.target as HTMLInputElement).value })} className="min-h-11 w-full rounded-md border border-[#D4D4CF] bg-white px-3" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-paper-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper-line text-[13px] text-[#5E5E66]">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-[#5E5E66]">Loading…</td></tr>}
            {!isLoading && !posts.length && <tr><td colSpan={4} className="px-4 py-6 text-[#5E5E66]">No posts yet. <Link to="/admin/posts/new">Write the first one.</Link></td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-[#EFEFEB]">
                <td className="px-4 py-3.5">
                  <Link to={`/admin/posts/${p.id}`} className="font-semibold no-underline">{p.title || "(untitled)"}</Link>
                  <div className="text-[13px] text-[#6B6B72]">/blog/{p.slug}</div>
                </td>
                <td className="px-4 py-3.5 text-[#45454C]">{categories.find((c) => c.id === p.category_id)?.name ?? "–"}</td>
                <td className="px-4 py-3.5"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3.5 text-sm text-[#45454C]">{p.status === "draft" ? `Edited ${formatDate(p.updated_at)}` : formatDate(p.published_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
