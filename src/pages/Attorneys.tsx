import { Hero, CtaLink, Section, ServiceGrid, Steps } from "@/components/site/blocks";
import { ConsultForm } from "@/components/site/ConsultForm";
import { Seo } from "@/components/site/Seo";
import { useSections, useServices } from "@/hooks/useContent";

export default function Attorneys() {
  const { sections } = useSections("attorneys");
  const { data: services = [] } = useServices();
  const relevant = services.filter((s) => s.audience === "attorney" || s.audience === "business" || s.slug === "surveillance");
  return (
    <>
      <Seo title="Litigation Support Investigations for Attorneys in Dallas" description="Witness locates, surveillance, asset searches and digital forensics for Dallas–Fort Worth law firms, documented in court-ready reports." />
      <Hero section={sections["attorneys.hero"]} fallback={{ eyebrow: "For attorneys", heading: "Investigations that hold up in court." }}>
        <div><CtaLink to="#consult">Discuss a case</CtaLink></div>
      </Hero>
      <Section title="What we do for law firms" alt>
        <ServiceGrid services={relevant} />
      </Section>
      <Section title="How we work with counsel">
        <Steps
          steps={[
            { title: "Confidential intake", desc: "Tell us the case and what you need proven. Privileged communications stay privileged." },
            { title: "Scope and budget", desc: "A written plan with a not-to-exceed budget before work starts." },
            { title: "Court-ready reporting", desc: "Documented findings, photos and video, and testimony when needed." },
          ]}
        />
      </Section>
      <section id="consult" className="bg-ink-2">
        <div className="container grid gap-12 py-16 md:grid-cols-2">
          <h2 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold uppercase tracking-tight">Discuss a case</h2>
          <ConsultForm defaultCaseType="Attorney / litigation support" />
        </div>
      </section>
    </>
  );
}
