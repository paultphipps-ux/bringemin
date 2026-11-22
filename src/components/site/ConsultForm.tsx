import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { getAttribution } from "@/lib/utils";

export const CASE_TYPES = [
  "Fugitive recovery / skip trace", "Infidelity", "Child custody", "Surveillance", "Background check / locate",
  "Asset search", "Computer or phone forensics", "Attorney / litigation support", "Business investigation", "Other",
];

export function ConsultForm({ defaultCaseType = "" }: { defaultCaseType?: string }) {
  const { pathname } = useLocation();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("company")) return; // honeypot
    setState("sending");
    const { error } = await supabase.from("leads").insert({
      name: String(f.get("name") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim() || null,
      email: String(f.get("email") ?? "").trim() || null,
      case_type: String(f.get("case_type") ?? "") || null,
      message: String(f.get("message") ?? "").trim() || null,
      contact_pref: (f.get("contact_pref") as string) || null,
      source_page: pathname,
      ...getAttribution(),
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-xl border border-ink-edge bg-ink-3 p-7">
        <h3 className="font-display text-2xl font-semibold">Thank you. We got your message.</h3>
        <p className="mt-2 text-bone-muted">An investigator will contact you shortly, the way you asked. If it's urgent, call us now.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-ink-edge bg-ink-3 p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required maxLength={200} autoComplete="name" />
        <Field label="Phone" name="phone" type="tel" maxLength={40} autoComplete="tel" />
      </div>
      <Field label="Email (optional)" name="email" type="email" maxLength={200} autoComplete="email" />
      <SelectField
        label="Type of case"
        name="case_type"
        defaultValue={defaultCaseType}
        options={[{ value: "", label: "Choose one" }, ...CASE_TYPES.map((c) => ({ value: c, label: c }))]}
      />
      <TextareaField label="Briefly, what's going on?" name="message" rows={4} maxLength={5000} />
      <fieldset className="flex flex-wrap gap-x-5 text-sm">
        <legend className="mb-1 font-medium">Safest way to reach you</legend>
        {(["call", "text", "email"] as const).map((p) => (
          <label key={p} className="flex min-h-[44px] items-center gap-2 capitalize">
            <input type="radio" name="contact_pref" value={p} defaultChecked={p === "call"} /> {p}
          </label>
        ))}
      </fieldset>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Request my free consultation"}</Button>
      {state === "error" && <p role="alert" className="text-sm text-brand-text">Something went wrong. Please call us instead.</p>}
      <p className="text-[13px] text-bone-dim">Your information is kept strictly confidential.</p>
    </form>
  );
}
