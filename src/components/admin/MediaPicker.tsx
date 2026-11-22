import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Media } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "./media";

export function useMediaLibrary(enabled = true) {
  return useQuery({
    queryKey: ["admin", "media"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as Media[];
    },
  });
}

export function UploadButton({ onUploaded, label = "Upload image" }: { onUploaded: (url: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const url = await uploadMedia(file);
            qc.invalidateQueries({ queryKey: ["admin", "media"] });
            onUploaded(url);
          } catch (err) {
            toast.error((err as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <Button type="button" variant="light" disabled={busy} onClick={() => input.current?.click()}>
        <ImagePlus size={16} aria-hidden /> {busy ? "Uploading…" : label}
      </Button>
    </>
  );
}

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (m: { url: string; alt: string | null }) => void }) {
  const { data = [] } = useMediaLibrary(open);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Media library" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 text-[#1D1D20]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Media library</h2>
          <div className="flex items-center gap-2">
            <UploadButton onUploaded={(url) => { onPick({ url, alt: null }); onClose(); }} />
            <button type="button" aria-label="Close" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-paper"><X /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {data.map((m) => (
            <button key={m.id} type="button" onClick={() => { onPick({ url: m.url, alt: m.alt }); onClose(); }} className="overflow-hidden rounded-lg border border-paper-line hover:ring-2 hover:ring-brand">
              <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
          {!data.length && <p className="col-span-full text-sm text-[#5E5E66]">No images yet. Upload one.</p>}
        </div>
      </div>
    </div>
  );
}

export function ImageField({ label, value, onChange }: { label: string; value: string | null; onChange: (url: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-20 w-28 rounded-md border border-paper-line object-cover" />
          <Button type="button" variant="light" onClick={() => setOpen(true)}>Change</Button>
          <Button type="button" variant="danger" onClick={() => onChange(null)}>Remove</Button>
        </div>
      ) : (
        <Button type="button" variant="light" onClick={() => setOpen(true)} className="self-start">Choose from media library</Button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(m) => onChange(m.url)} />
    </div>
  );
}
