import { supabase } from "@/integrations/supabase/client";

/** Upload a file to the public 'media' bucket and record it in the media library. */
export async function uploadMedia(file: File, alt?: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  const dims = await imageSize(file).catch(() => null);
  const { data: { user } } = await supabase.auth.getUser();
  const { error: e2 } = await supabase.from("media").insert({
    path, url: data.publicUrl, alt: alt ?? null, width: dims?.w ?? null, height: dims?.h ?? null, uploaded_by: user?.id ?? null,
  });
  if (e2) throw e2;
  return data.publicUrl;
}

function imageSize(file: File) {
  return new Promise<{ w: number; h: number }>((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("not an image"));
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
