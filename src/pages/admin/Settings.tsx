import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSettings } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Field, TextareaField } from "@/components/ui/field";
import { AdminHeader } from "./AdminLayout";

const FIELDS: { key: keyof SiteSettings; label: string; area?: boolean; hint?: string }[] = [
  { key: "business_name", label: "Business name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Public email" },
  { key: "license_number", label: "Texas DPS company license number", hint: "Shown in the footer, home page, bail bond page, about page and contact page." },
  { key: "hours", label: "Hours" },
  { key: "service_area", label: "Service area" },
  { key: "address", label: "Address (optional)", area: true },
  { key: "google_business_url", label: "Google Business Profile URL" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "default_seo_title", label: "Default page title (SEO)" },
  { key: "default_seo_description", label: "Default meta description (SEO)", area: true },
];

export default function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as SiteSettings;
    },
  });
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { if (data) setS(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { id: _i, updated_at: _u, ...values } = s!;
      const { error } = await supabase.from("site_settings").update(values).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["site_settings"] }); qc.invalidateQueries({ queryKey: ["admin", "site_settings"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!s) return <p>Loading…</p>;
  return (
    <>
      <AdminHeader title="Site settings" subtitle="Contact details and defaults used across the whole site." />
      <form className="flex max-w-2xl flex-col gap-4 rounded-xl border border-paper-line bg-white p-6" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        {FIELDS.map((f) =>
          f.area ? (
            <TextareaField key={f.key} tone="light" label={f.label} hint={f.hint} rows={3} value={(s[f.key] as string) ?? ""} onChange={(e) => setS({ ...s, [f.key]: e.target.value || null })} />
          ) : (
            <Field key={f.key} tone="light" label={f.label} hint={f.hint} value={(s[f.key] as string) ?? ""} onChange={(e) => setS({ ...s, [f.key]: e.target.value || null })} />
          ),
        )}
        <label className="flex min-h-[44px] items-center gap-3 font-medium">
          <input type="checkbox" className="h-5 w-5 accent-brand" checked={s.insured} onChange={(e) => setS({ ...s, insured: e.target.checked })} />
          Show "Licensed &amp; insured" on the site
        </label>
        <Button type="submit" className="self-start" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save settings"}</Button>
      </form>
    </>
  );
}
