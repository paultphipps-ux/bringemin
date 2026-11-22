import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Post, PostRevision, PostStatus } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageField } from "@/components/admin/MediaPicker";
import { formatDate, slugify } from "@/lib/utils";

type Draft = Omit<Post, "id" | "created_at" | "updated_at" | "author_id">;

const EMPTY: Draft = {
  title: "", slug: "", excerpt: "", body: "", cover_image_url: null, category_id: null, status: "draft",
  published_at: null, seo_title: "", seo_description: "", og_image_url: null,
};

/** datetime-local <-> ISO */
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

export default function PostEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const { session } = useAuth();
  const { data: categories = [] } = useCategories();
  const [post, setPost] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const idRef = useRef<string | null>(isNew ? null : id!);

  const { data: loaded } = useQuery({
    queryKey: ["admin", "post", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Post;
    },
  });
  useEffect(() => {
    if (loaded) {
      const { id: _i, created_at: _c, updated_at, author_id: _a, ...rest } = loaded;
      setPost({ ...EMPTY, ...rest, excerpt: rest.excerpt ?? "", seo_title: rest.seo_title ?? "", seo_description: rest.seo_description ?? "" });
      setSavedAt(updated_at);
    }
  }, [loaded]);

  const { data: revisions = [] } = useQuery({
    queryKey: ["admin", "revisions", idRef.current],
    enabled: showRevisions && !!idRef.current,
    queryFn: async () => {
      const { data, error } = await supabase.from("post_revisions").select("*").eq("post_id", idRef.current!).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as PostRevision[];
    },
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setPost((p) => {
      const next = { ...p, [k]: v };
      if (k === "title" && !slugTouched) next.slug = slugify(String(v));
      return next;
    });
    setDirty(true);
  };

  async function save(nextStatus?: PostStatus) {
    const status = nextStatus ?? post.status;
    if (!post.title.trim()) return toast.error("Add a title first.");
    const slug = post.slug || slugify(post.title);
    let published_at = post.published_at;
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "scheduled" && (!published_at || new Date(published_at) <= new Date())) return toast.error("Pick a future publish date to schedule.");
    if (status === "draft") published_at = post.published_at && post.status !== "draft" ? null : published_at;

    const row = {
      ...post, slug, status, published_at,
      excerpt: post.excerpt || null, seo_title: post.seo_title || null, seo_description: post.seo_description || null,
    };
    setSaving(true);
    const res = idRef.current
      ? await supabase.from("posts").update(row).eq("id", idRef.current).select("id,updated_at").single()
      : await supabase.from("posts").insert({ ...row, author_id: session?.user.id ?? null }).select("id,updated_at").single();
    setSaving(false);
    if (res.error) {
      toast.error(res.error.code === "23505" ? "That URL slug is already used by another post." : res.error.message);
      return;
    }
    setPost((p) => ({ ...p, slug, status, published_at }));
    setSavedAt(res.data.updated_at);
    setDirty(false);
    qc.invalidateQueries({ queryKey: ["admin", "posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
    if (!idRef.current) {
      idRef.current = res.data.id;
      nav(`/admin/posts/${res.data.id}`, { replace: true });
    }
    if (nextStatus === "published") toast.success("Published.");
    else if (nextStatus === "scheduled") toast.success(`Scheduled for ${formatDate(published_at)}.`);
  }

  // Autosave drafts every 30 seconds while there are unsaved changes.
  useEffect(() => {
    if (!dirty || post.status !== "draft" || !post.title.trim()) return;
    const t = setTimeout(() => save(), 30_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, post]);

  async function remove() {
    if (!idRef.current || !window.confirm("Delete this post permanently? This cannot be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", idRef.current);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "posts"] });
    nav("/admin/posts");
  }

  const preview = `${window.location.origin}/blog/${post.slug}`;

  return (
    <div className="-mx-5 -my-8 md:-mx-10">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-paper-line bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/admin/posts" className="inline-flex min-h-11 items-center gap-1 font-medium no-underline"><ChevronLeft size={18} aria-hidden /> All posts</Link>
          <span className="text-[13px] capitalize text-[#6B6B72]">
            {post.status}{savedAt ? ` · Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}{dirty ? " · Unsaved changes" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {post.status === "published" && <a href={preview} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-paper-line bg-white px-4 font-medium no-underline">View</a>}
          <Button variant="light" disabled={saving} onClick={() => save(post.status === "published" ? "published" : "draft")}>{post.status === "published" ? "Update" : "Save draft"}</Button>
          {post.status !== "published" && (
            <Button disabled={saving} onClick={() => save(post.published_at && new Date(post.published_at) > new Date() ? "scheduled" : "published")}>
              {post.published_at && new Date(post.published_at) > new Date() ? "Schedule" : "Publish"}
            </Button>
          )}
          {post.status === "published" && <Button variant="light" disabled={saving} onClick={() => save("draft")}>Unpublish</Button>}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1360px] flex-wrap gap-6 px-6 py-7">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4 rounded-xl border border-paper-line bg-white px-6 py-7 md:px-10">
          <label>
            <span className="sr-only">Post title</span>
            <input value={post.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" className="w-full border-0 py-1 text-[34px] font-bold focus:outline-none" />
          </label>
          <RichTextEditor value={post.body} onChange={(html) => set("body", html)} />
        </div>

        <aside className="flex flex-[1_1_300px] flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-xl border border-paper-line bg-white p-5">
            <h2 className="text-[15px] font-semibold">Publish</h2>
            <Field tone="light" label="Publish date" type="datetime-local" value={toLocal(post.published_at)} onChange={(e) => set("published_at", fromLocal(e.target.value))} hint="Pick a future date and press Schedule to publish it later." />
            {idRef.current && (
              <button type="button" className="self-start text-[13px] underline" onClick={() => setShowRevisions((v) => !v)}>
                {showRevisions ? "Hide" : "Show"} revision history
              </button>
            )}
            {showRevisions && (
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
                {revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                    <button type="button" className="underline" onClick={() => { setPost((p) => ({ ...p, title: r.title, body: r.body })); setDirty(true); toast("Revision restored. Save to keep it."); }}>Restore</button>
                  </li>
                ))}
                {!revisions.length && <li className="text-[#6B6B72]">No earlier versions yet.</li>}
              </ul>
            )}
            {idRef.current && <button type="button" className="self-start text-[13px] text-brand underline" onClick={remove}>Delete post</button>}
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-paper-line bg-white p-5">
            <h2 className="text-[15px] font-semibold">Details</h2>
            <Field tone="light" label="URL slug" value={post.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} hint={`/blog/${post.slug || "…"}`} />
            <SelectField
              tone="light"
              label="Category"
              value={post.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              options={[{ value: "", label: "None" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <TextareaField tone="light" label="Excerpt" rows={3} value={post.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} hint="Shown on the blog list and in search results if no meta description is set." />
            <ImageField label="Cover image" value={post.cover_image_url} onChange={(v) => set("cover_image_url", v)} />
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-paper-line bg-white p-5">
            <h2 className="text-[15px] font-semibold">Search engine (SEO)</h2>
            <Field tone="light" label="SEO title" value={post.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} maxLength={70} hint={`${(post.seo_title || post.title).length}/60 recommended`} />
            <TextareaField tone="light" label="Meta description" rows={3} value={post.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} maxLength={200} hint={`${(post.seo_description ?? "").length}/155 recommended`} />
            <ImageField label="Social share image" value={post.og_image_url} onChange={(v) => set("og_image_url", v)} />
            <div className="flex flex-col gap-0.5 rounded-lg border border-paper-line p-3 text-[13px]">
              <span className="text-[#1D6B2C]">bringemininvestigations.com › blog › {post.slug}</span>
              <span className="text-base text-[#1F4E8C]">{post.seo_title || post.title || "Post title"}</span>
              <span className="text-[#5E5E66]">{post.seo_description || post.excerpt || "Add a meta description to control what Google shows."}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
