import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Faq, PageSection, Service } from "@/integrations/supabase/types";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Spaced-caps label between rules, echoing "— INVESTIGATIONS —" in the logo. */
export function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <p className={cn("flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.28em] text-steel", center && "justify-center")}>
      <span aria-hidden className="h-0.5 w-8 shrink-0 bg-brand" />
      <span>{children}</span>
      {center && <span aria-hidden className="h-0.5 w-8 shrink-0 bg-brand" />}
    </p>
  );
}

export function Section({ id, title, intro, alt, children, labelledBy }: {
  id?: string; title?: string; intro?: string; alt?: boolean; children: ReactNode; labelledBy?: string;
}) {
  const headingId = labelledBy ?? (title ? `${id ?? title.toLowerCase().replace(/\W+/g, "-")}-h` : undefined);
  return (
    <section id={id} aria-labelledby={headingId} className={cn("border-b border-ink-line", alt && "bg-ink-2")}>
      <div className="container flex flex-col gap-8 py-16 md:py-20">
        {title && (
          <div className="flex flex-col gap-3">
            <span aria-hidden className="h-1 w-12 bg-brand" />
            <h2 id={headingId} className="font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase leading-[1.1] tracking-tight">{title}</h2>
            {intro && <p className="max-w-2xl text-bone-muted">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Hero({ section, fallback, children, art = false }: {
  section?: PageSection; fallback: { eyebrow?: string; heading: string; body?: string }; children?: ReactNode;
  /** Show the reaper mark beside the copy (home page). */
  art?: boolean;
}) {
  const eyebrow = section?.eyebrow ?? fallback.eyebrow;
  return (
    <section className="relative overflow-hidden border-b border-ink-line bg-[radial-gradient(ellipse_at_75%_20%,rgba(193,1,2,0.16),transparent_55%)]">
      <div className={cn("container grid items-center gap-10 py-20 md:py-24", art && "lg:grid-cols-[minmax(0,1fr)_380px]")}>
        <div className="flex flex-col gap-7">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="max-w-4xl font-display text-[clamp(36px,5vw,64px)] font-black uppercase leading-[1] tracking-tight">{section?.heading ?? fallback.heading}</h1>
          {(section?.body ?? fallback.body) && <p className="max-w-2xl text-xl text-bone-muted">{section?.body ?? fallback.body}</p>}
          {children}
        </div>
        {art && (
          <img src="/brand/mark-dark-bg.png" alt="" width={512} height={365} className="mx-auto hidden w-full max-w-[380px] drop-shadow-[0_20px_60px_rgba(193,1,2,0.25)] lg:block" />
        )}
      </div>
    </section>
  );
}

export function CtaLink({ to, children, variant = "primary" }: { to: string; children: ReactNode; variant?: "primary" | "outline" }) {
  return to.startsWith("tel:") || to.startsWith("http") ? (
    <a href={to} className={buttonClass(variant, "px-6 py-4 text-[17px] no-underline")}>{children}</a>
  ) : (
    <Link to={to} className={buttonClass(variant, "px-6 py-4 text-[17px] no-underline")}>{children}</Link>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-ink-edge bg-ink-edge sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <Link key={s.id} to={`/services/${s.slug}`} className="group flex min-h-[150px] flex-col gap-2 border-t-2 border-transparent bg-ink-2 p-6 no-underline hover:border-brand hover:bg-ink-3">
          <span className="font-display text-lg font-bold uppercase tracking-tight text-bone">{s.name}</span>
          <span className="text-[15px] text-[#B4B4BA]">{s.summary}</span>
        </Link>
      ))}
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <div className="flex flex-col">
      {faqs.map((f) => (
        <details key={f.id} className="border-b border-ink-edge py-4">
          <summary className="min-h-[28px] cursor-pointer font-semibold">{f.question}</summary>
          <p className="mt-3 whitespace-pre-line text-bone-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {steps.map((st, i) => (
        <div key={st.title} className="flex flex-col gap-2.5">
          <span className="font-display text-5xl font-black leading-none text-brand">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">{st.title}</h3>
          <p className="text-[15px] text-bone-muted">{st.desc}</p>
        </div>
      ))}
    </div>
  );
}
