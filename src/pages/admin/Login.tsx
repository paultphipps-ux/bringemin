import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function Login() {
  const { session } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"password" | "reset">("password");
  const [notice, setNotice] = useState<string | null>(null);

  if (session) return <Navigate to={(location.state as { from?: string } | null)?.from ?? "/admin"} replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    setBusy(true);
    setError(null);
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/reset-password` });
      setBusy(false);
      if (error) setError(error.message);
      else setNotice("If that email has an account, a reset link is on its way.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: String(f.get("password")) });
    setBusy(false);
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4 font-sans">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 text-[#1D1D20]">
        <div className="font-display text-2xl font-bold">BRING ’EM <span className="text-brand">IN</span> <span className="text-base font-medium text-[#5E5E66]">admin</span></div>
        <Field tone="light" label="Email" name="email" type="email" required autoComplete="username" />
        {mode === "password" && <Field tone="light" label="Password" name="password" type="password" required autoComplete="current-password" />}
        {error && <p role="alert" className="text-sm text-brand">{error}</p>}
        {notice && <p role="status" className="text-sm text-[#1D6B2C]">{notice}</p>}
        <Button type="submit" disabled={busy}>{mode === "password" ? "Sign in" : "Send reset link"}</Button>
        <button type="button" className="text-sm underline" onClick={() => { setMode(mode === "password" ? "reset" : "password"); setNotice(null); setError(null); }}>
          {mode === "password" ? "Forgot password?" : "Back to sign in"}
        </button>
      </form>
    </div>
  );
}
