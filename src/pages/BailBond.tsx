import { Check } from "lucide-react";
import { FaqList, Section, Steps } from "@/components/site/blocks";
import { SkipForm } from "@/components/site/SkipForm";
import { Seo } from "@/components/site/Seo";
import { useFaqs, useSections, useSiteSettings } from "@/hooks/useContent";
import { telHref } from "@/lib/utils";

const STEPS = [
  { title: "Submit the skip", desc: "Use the form or call. Send the bond paperwork and anything you know." },
  { title: "Skip trace", desc: "Database searches, associates, social media and field work to find a current location." },
  { title: "Locate and confirm", desc: "We verify the location and keep you updated before any recovery." },
  { title: "Recover and surrender", desc: "Lawful apprehension and surrender to the county, with documentation for your file." },
];

export default function BailBond() {
  const s = useSiteSettings();
  const { sections } = useSections("bail");
  const { data: faqs = [] } = useFaqs("bail");
  const hero = sections["bail.hero"];

  return (
    <>
      <Seo
        title="Fugitive Recovery & Skip Tracing for Bail Bond Companies"
        description="Licensed Texas investigators handling skip tracing and fugitive recovery for bail bond companies across Dallas–Fort Worth. Submit a skip online or call 24/7."
      />
      <section className="border-b border-ink-line">
        <div className="container grid items-start gap-12 py-20 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-text">{hero?.eyebrow ?? "For bail bond companies"}</p>
            <h1 className="font-display text-[clamp(40px,6vw,68px)] font-bold leading-[1.04]">{hero?.heading ?? "Your defendant skipped. We bring 'em in."}</h1>
            <p className="text-[19px] text-bone-muted">{hero?.body ?? "Licensed Texas investigators handling skip tracing and fugitive recovery across Dallas–Fort Worth, so you don't forfeit the bond."}</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {[
                s.license_number ? `Texas PI License #${s.license_number}` : "Licensed Texas private investigators",
                "Status updates on every case until the defendant is located or recovered",
                s.service_area ? `Serving ${s.service_area}` : "Serving Dallas–Fort Worth",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3"><Check className="mt-1 shrink-0 text-brand-text" size={20} aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          <SkipForm />
        </div>
      </section>

      <Section title="How recovery works" alt>
        <Steps steps={STEPS} />
      </Section>

      {faqs.length > 0 && (
        <Section title="Questions bondsmen ask">
          <div className="max-w-3xl"><FaqList faqs={faqs} /></div>
        </Section>
      )}

      <section className="bg-brand">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="font-display text-4xl font-bold text-white">Got a skip right now? Call us.</h2>
          <a href={telHref(s.phone)} className="rounded-md bg-ink px-7 py-4 text-xl font-semibold text-white no-underline">{s.phone}</a>
        </div>
      </section>
    </>
  );
}
