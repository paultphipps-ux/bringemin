import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, TextareaField } from "@/components/ui/field";

export function SkipForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("website")) return; // honeypot
    const v = (k: string) => String(f.get(k) ?? "").trim();
    setState("sending");
    const { error } = await supabase.from("skip_submissions").insert({
      bond_company: v("bond_company"),
      agent_name: v("agent_name"),
      agent_phone: v("agent_phone"),
      agent_email: v("agent_email") || null,
      defendant_name: v("defendant_name"),
      defendant_dob: v("defendant_dob") || null,
      bond_amount: v("bond_amount") || null,
      county: v("county") || null,
      last_known_address: v("last_known_address") || null,
      notes: v("notes") || null,
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-xl border border-ink-edge bg-ink-3 p-7">
        <h2 className="font-display text-2xl font-semibold">Skip received.</h2>
        <p className="mt-2 text-bone-muted">We'll call you to confirm the details and get started.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby="skipform" className="flex flex-col gap-3.5 rounded-xl border border-ink-edge bg-ink-3 p-7">
      <h2 id="skipform" className="font-display text-3xl font-semibold">Submit a skip</h2>
      <p className="-mt-1 text-sm text-bone-dim">Sent securely to our recovery team. We call you back to confirm.</p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Bond company" name="bond_company" required maxLength={200} />
        <Field label="Your name" name="agent_name" required maxLength={200} />
        <Field label="Phone" name="agent_phone" type="tel" required maxLength={40} />
        <Field label="Email" name="agent_email" type="email" maxLength={200} />
      </div>
      <hr className="my-1 border-ink-edge" />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Defendant name" name="defendant_name" required maxLength={200} />
        <Field label="Date of birth" name="defendant_dob" type="date" />
        <Field label="Bond amount" name="bond_amount" maxLength={50} />
        <Field label="County" name="county" maxLength={100} />
      </div>
      <Field label="Last known address" name="last_known_address" maxLength={500} />
      <TextareaField label="Notes (charge, missed court date, known associates)" name="notes" rows={3} maxLength={5000} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Submit skip"}</Button>
      {state === "error" && <p role="alert" className="text-sm text-brand-text">Something went wrong. Please call us instead.</p>}
    </form>
  );
}
