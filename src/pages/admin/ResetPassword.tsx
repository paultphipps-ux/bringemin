import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function ResetPassword() {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else nav("/admin");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4 font-sans">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 text-[#1D1D20]">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <Field tone="light" label="New password" name="password" type="password" minLength={10} required autoComplete="new-password" />
        {error && <p role="alert" className="text-sm text-brand">{error}</p>}
        <Button type="submit">Save password</Button>
      </form>
    </div>
  );
}
