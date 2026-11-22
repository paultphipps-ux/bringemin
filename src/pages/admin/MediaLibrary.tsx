import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Media } from "@/integrations/supabase/types";
import { UploadButton, useMediaLibrary } from "@/components/admin/MediaPicker";
import { AdminHeader } from "./AdminLayout";

export default function MediaLibrary() {
  const { data = [] } = useMediaLibrary();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "media"] });

  async function saveAlt(m: Media, alt: string) {
    if (alt === (m.alt ?? "")) return;
    const { error } = await supabase.from("media").update({ alt: alt || null }).eq("id", m.id);
    if (error) toast.error(error.message);
    else refresh();
  }
  async function remove(m: Media) {
    if (!window.confirm("Delete this image? Pages or posts using it will show a broken image. This cannot be undone.")) return;
    const { error } = await supabase.storage.from("media").remove([m.path]);
    if (error) return toast.error(error.message);
    await supabase.from("media").delete().eq("id", m.id);
    refresh();
  }

  return (
    <>
      <AdminHeader title="Media library" subtitle="Images used on pages, services and blog posts." actions={<UploadButton onUploaded={() => toast.success("Uploaded.")} />} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {data.map((m) => (
          <figure key={m.id} className="m-0 flex flex-col gap-2 rounded-xl border border-paper-line bg-white p-2.5">
            <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full rounded-md object-cover" loading="lazy" />
            <label className="text-xs font-medium">
              Alt text
              <input defaultValue={m.alt ?? ""} onBlur={(e) => saveAlt(m, e.target.value)} className="mt-1 min-h-9 w-full rounded border border-[#D4D4CF] px-2 text-sm" />
            </label>
            <div className="flex justify-between text-xs">
              <button type="button" className="underline" onClick={() => { navigator.clipboard.writeText(m.url); toast("URL copied."); }}>Copy URL</button>
              <button type="button" className="text-brand underline" onClick={() => remove(m)}>Delete</button>
            </div>
          </figure>
        ))}
        {!data.length && <p className="col-span-full text-[#5E5E66]">No images yet.</p>}
      </div>
    </>
  );
}
