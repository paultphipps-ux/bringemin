import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { PageSection } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Field, TextareaField } from "@/components/ui/field";
import { ImageField } from "@/components/admin/MediaPicker";
import { AdminHeader } from "./AdminLayout";

const PAGE_NAMES: Record<string, string> = { home: "Home", bail: "Bail bond agents", attorneys: "Attorneys", about: "About" };

export default function PageContent() {
  const qc = useQueryClient();
  const { data: sections = [] } = useQuery({
    queryKey: ["admin", "page_sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_sections").select("*").order("page").order("sort");
      if (error) throw error;
      return data as PageSection[];
    },
  });
  const [openKey, setOpenKey] = useState<string | null>(null);
  const pages = [...new Set(sections.map((s) => s.page))];

  return (
    <>
      <AdminHeader title="Page content" subtitle="Edit the headlines, text and images on each page." />
      <div className="flex max-w-3xl flex-col gap-8">
        {pages.map((page) => (
          <section key={page} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{PAGE_NAMES[page] ?? page}</h2>
            {sections.filter((s) => s.page === page).map((s) => (
              <SectionEditor key={s.key} section={s} open={openKey === s.key} onToggle={() => setOpenKey(openKey === s.key ? null : s.key)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "page_sections"] }); qc.invalidateQueries({ queryKey: ["page_sections"] }); }} />
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

function SectionEditor({ section, open, onToggle, onSaved }: { section: PageSection; open: boolean; onToggle: () => void; onSaved: () => void }) {
  const [s, setS] = useState(section);
  const save = useMutation({
    mutationFn: async () => {
      const { key, page: _p, label: _l, updated_at: _u, sort: _s, ...values } = s;
      const { error } = await supabase.from("page_sections").update(values).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved."); onSaved(); },
    onError: (e) => toast.error((e as Error).message),
  });
  const set = (k: keyof PageSection) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value || null });

  return (
    <div className="rounded-xl border border-paper-line bg-white">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-12 w-full items-center justify-between px-5 text-left font-medium">
        {section.label}
        <span className="text-sm text-[#6B6B72]">{open ? "Close" : "Edit"}</span>
      </button>
      {open && (
        <form className="flex flex-col gap-3.5 border-t border-paper-line p-5" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field tone="light" label="Small label above headline" value={s.eyebrow ?? ""} onChange={set("eyebrow")} />
          <Field tone="light" label="Headline" value={s.heading ?? ""} onChange={set("heading")} />
          <TextareaField tone="light" label="Text" rows={4} value={s.body ?? ""} onChange={set("body")} />
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field tone="light" label="Button text" value={s.cta_label ?? ""} onChange={set("cta_label")} />
            <Field tone="light" label="Button link" value={s.cta_href ?? ""} onChange={set("cta_href")} hint="e.g. /contact" />
          </div>
          <ImageField label="Image" value={s.image_url} onChange={(v) => setS({ ...s, image_url: v })} />
          <Button type="submit" className="self-start" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save section"}</Button>
        </form>
      )}
    </div>
  );
}
