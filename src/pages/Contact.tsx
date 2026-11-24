import { Hero } from "@/components/site/blocks";
import { ConsultForm } from "@/components/site/ConsultForm";
import { Seo } from "@/components/site/Seo";
import { useSiteSettings } from "@/hooks/useContent";
import { telHref } from "@/lib/utils";

export default function Contact() {
  const s = useSiteSettings();
  return (
    <>
      <Seo title="Free Confidential Consultation" description="Talk to a licensed Dallas private investigator. Free, confidential consultation by phone or online, 24/7." />
      <Hero fallback={{ eyebrow: "Contact", heading: "Free confidential consultation" }} />
      <section className="bg-ink-2">
        <div className="container grid gap-12 py-16 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-bone-muted">Tell us a little about your situation. Only our investigators see your message, and we contact you the way you choose.</p>
            <a href={telHref(s.phone)} className="font-display text-4xl font-semibold no-underline">{s.phone}</a>
            {s.email && <a href={`mailto:${s.email}`} className="no-underline">{s.email}</a>}
            <p className="text-bone-dim">{[s.hours, s.service_area].filter(Boolean).join(" · ")}</p>
            {s.address && <p className="whitespace-pre-line text-bone-dim">{s.address}</p>}
            {s.license_number && <p className="text-sm text-bone-dim">Licensed by Texas DPS · License #{s.license_number}</p>}
          </div>
          <ConsultForm />
        </div>
      </section>
    </>
  );
}
