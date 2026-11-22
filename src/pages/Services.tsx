import { Hero, Section, ServiceGrid } from "@/components/site/blocks";
import { Seo } from "@/components/site/Seo";
import { useServices } from "@/hooks/useContent";

export default function Services() {
  const { data: services = [] } = useServices();
  return (
    <>
      <Seo title="Private Investigation Services in Dallas, TX" description="Fugitive recovery, skip tracing, surveillance, infidelity, child custody, background checks, asset searches, digital forensics and corporate investigations across Dallas–Fort Worth." />
      <Hero fallback={{ eyebrow: "Services", heading: "Private investigation services", body: "Every case starts with a free, confidential consultation and a written plan and quote." }} />
      <Section>
        <ServiceGrid services={services} />
      </Section>
    </>
  );
}
