import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminHeader } from "./AdminLayout";

async function count(table: string, filter?: [string, string]) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: c } = await q;
  return c ?? 0;
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin", "dashboard", isAdmin],
    queryFn: async () => ({
      newLeads: isAdmin ? await count("leads", ["status", "new"]) : null,
      newSkips: isAdmin ? await count("skip_submissions", ["status", "new"]) : null,
      drafts: await count("posts", ["status", "draft"]),
      published: await count("posts", ["status", "published"]),
    }),
  });
  const tiles = [
    isAdmin && { label: "New leads", value: data?.newLeads, to: "/admin/leads" },
    isAdmin && { label: "New skips", value: data?.newSkips, to: "/admin/skips" },
    { label: "Draft posts", value: data?.drafts, to: "/admin/posts?status=draft" },
    { label: "Published posts", value: data?.published, to: "/admin/posts?status=published" },
  ].filter(Boolean) as { label: string; value?: number | null; to: string }[];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Everything on bringemininvestigations.com is edited from here." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="flex flex-col gap-1 rounded-xl border border-paper-line bg-white p-5 no-underline hover:border-[#C9C9C4]">
            <span className="text-sm text-[#5E5E66]">{t.label}</span>
            <span className="text-3xl font-semibold">{t.value ?? "–"}</span>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/posts/new" className="rounded-md bg-brand px-4 py-3 font-semibold text-white no-underline">Write a new post</Link>
        <Link to="/admin/pages" className="rounded-md border border-paper-line bg-white px-4 py-3 font-medium no-underline">Edit page content</Link>
        <Link to="/admin/services" className="rounded-md border border-paper-line bg-white px-4 py-3 font-medium no-underline">Edit services</Link>
      </div>
    </>
  );
}
