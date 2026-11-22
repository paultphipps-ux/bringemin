// Supabase Edge Function: alerts the owner when a lead or skip arrives.
// Wire it up with a Database Webhook (Database > Webhooks) on INSERT into
// public.leads and public.skip_submissions, pointing at this function.
//
// The alert deliberately contains NO case details: just that something came in
// and a link to the admin. Required secrets (supabase secrets set ...):
//   RESEND_API_KEY      Resend API key for email
//   ALERT_EMAIL_TO      where alerts go
//   ALERT_EMAIL_FROM    verified sender, e.g. alerts@bringemininvestigations.com
//   SITE_URL            e.g. https://bringemininvestigations.com
//   WEBHOOK_SECRET      shared secret sent by the webhook in the x-webhook-secret header

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const table = payload?.table as string | undefined;
  if (payload?.type !== "INSERT" || (table !== "leads" && table !== "skip_submissions")) {
    return new Response("Ignored", { status: 200 });
  }

  const site = Deno.env.get("SITE_URL") ?? "";
  const isSkip = table === "skip_submissions";
  const subject = isSkip ? "New skip submitted" : "New website inquiry";
  const link = `${site}/admin/${isSkip ? "skips" : "leads"}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("ALERT_EMAIL_FROM"),
      to: Deno.env.get("ALERT_EMAIL_TO"),
      subject,
      text: `${subject}. Sign in to view it: ${link}`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return new Response("Alert failed", { status: 502 });
  }
  return new Response("OK", { status: 200 });
});
