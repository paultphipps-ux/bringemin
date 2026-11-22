import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { RichTextEditor } from "./RichTextEditor";
import { ImageField } from "./MediaPicker";
import { slugify } from "@/lib/utils";
import { AdminHeader } from "@/pages/admin/AdminLayout";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "richtext" | "image" | "boolean" | "slug"; required?: boolean; hint?: string; from?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean; hint?: string };

type Row = Record<string, unknown> & { id: string };

export interface ResourceConfig {
  table: string;
  title: string;
  subtitle?: string;
  singular: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render?: (row: Row) => React.ReactNode }[];
  sortable?: boolean;           // has an integer "sort" column
  orderBy?: string;
  defaults?: Record<string, unknown>;
  invalidate?: string[];        // public query keys to refresh after changes
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const key = ["admin", config.table];

  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(config.table).select("*").order(config.sortable ? "sort" : config.orderBy ?? "created_at", { ascending: config.sortable ?? false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    config.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, created_at: _c, updated_at: _u, ...values } = row;
      for (const f of config.fields) {
        if (f.type === "slug" && !values[f.key]) values[f.key] = slugify(String(values[(f as { from?: string }).from ?? "name"] ?? ""));
        if (values[f.key] === "") values[f.key] = null;
      }
      if (id) {
        const { error } = await supabase.from(config.table).update(values).eq("id", id);
        if (error) throw error;
      } else {
        if (config.sortable) values.sort = rows.length;
        const { error } = await supabase.from(config.table).insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { refresh(); setEditing(null); toast.success("Saved."); },
    onError: (e) => toast.error((e as { code?: string }).code === "23505" ? "That slug or name is already used." : (e as Error).message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setEditing(null); toast.success("Deleted."); },
    onError: (e) => toast.error((e as Error).message),
  });

  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from(config.table).update({ sort: i + dir }).eq("id", a.id),
      supabase.from(config.table).update({ sort: i }).eq("id", b.id),
    ]);
    refresh();
  }

  if (editing) {
    return (
      <>
        <AdminHeader title={editing.id ? `Edit ${config.singular}` : `New ${config.singular}`} />
        <form
          className="flex max-w-3xl flex-col gap-4 rounded-xl border border-paper-line bg-white p-6"
          onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
        >
          {config.fields.map((f) => {
            const v = editing[f.key];
            const set = (val: unknown) => setEditing({ ...editing, [f.key]: val });
            switch (f.type) {
              case "textarea":
                return <TextareaField key={f.key} tone="light" label={f.label} hint={f.hint} rows={4} required={f.required} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} />;
              case "richtext":
                return (
                  <div key={f.key} className="flex flex-col gap-1.5 text-sm font-medium">
                    {f.label}
                    <div className="rounded-lg border border-paper-line px-3 py-2"><RichTextEditor label={f.label} value={(v as string) ?? ""} onChange={set} /></div>
                  </div>
                );
              case "image":
                return <ImageField key={f.key} label={f.label} value={(v as string) ?? null} onChange={set} />;
              case "boolean":
                return (
                  <label key={f.key} className="flex min-h-11 items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} className="h-5 w-5" /> {f.label}
                  </label>
                );
              case "select":
                return <SelectField key={f.key} tone="light" label={f.label} required={f.required} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} options={[{ value: "", label: "–" }, ...f.options]} />;
              case "slug":
                return <Field key={f.key} tone="light" label={f.label} hint={f.hint ?? "Leave blank to generate from the name."} value={(v as string) ?? ""} onChange={(e) => set(slugify(e.target.value))} />;
              default:
                return <Field key={f.key} tone="light" label={f.label} hint={f.hint} required={f.required} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} />;
            }
          })}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="light" onClick={() => setEditing(null)}>Cancel</Button>
            {editing.id && (
              <Button type="button" variant="danger" className="ml-auto" onClick={() => window.confirm(`Delete this ${config.singular}? This cannot be undone.`) && remove.mutate(editing.id)}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={<Button onClick={() => setEditing({ id: "", ...(config.defaults ?? {}) } as Row)}><Plus size={16} aria-hidden /> Add {config.singular}</Button>}
      />
      <div className="overflow-x-auto rounded-xl border border-paper-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper-line text-[13px] text-[#5E5E66]">
              {config.columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
              {config.sortable && <th className="px-4 py-3 font-semibold"><span className="sr-only">Order</span></th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="px-4 py-6 text-[#5E5E66]">Loading…</td></tr>}
            {!isLoading && !rows.length && <tr><td colSpan={9} className="px-4 py-6 text-[#5E5E66]">Nothing yet.</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b border-[#EFEFEB]">
                {config.columns.map((c, ci) => (
                  <td key={c.key} className="px-4 py-3.5">
                    {ci === 0 ? (
                      <button type="button" className="text-left font-semibold hover:underline" onClick={() => setEditing(r)}>{c.render ? c.render(r) : String(r[c.key] ?? "")}</button>
                    ) : c.render ? c.render(r) : String(r[c.key] ?? "–")}
                  </td>
                ))}
                {config.sortable && (
                  <td className="px-4 py-2 text-right">
                    <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-paper disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-paper disabled:opacity-30"><ArrowDown size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export const publishedBadge = (r: Row) => (r.published ? <span className="text-[#1D6B2C]">Published</span> : <span className="text-[#6B6B72]">Hidden</span>);
