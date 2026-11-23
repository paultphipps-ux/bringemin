import { useParams } from "react-router-dom";
import { FaqList, Hero, Section } from "@/components/site/blocks";
import { ConsultForm } from "@/components/site/ConsultForm";
import { Seo } from "@/components/site/Seo";
import { useFaqs, useService } from "@/hooks/useContent";
import { safeHtml } from "@/lib/utils";
import NotFound from "./NotFound";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { data: service, isLoading } = useService(slug);
  const { data: faqs = [] } = useFaqs(slug ?? "");
  if (isLoading) return <div className="container py-24 text-bone-dim">Loading…</div>;
  if (!service) return <NotFound />;

  return (
    <>
      <Seo
        title={service.seo_title ?? `${service.name} in Dallas, TX`}
        description={service.seo_description ?? service.summary}
        image={service.image_url}
        jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: service.name, description: service.summary, areaServed: "Dallas–Fort Worth, TX" }}
      />
      <Hero fallback={{ eyebrow: "Services", heading: service.name, body: service.summary ?? undefined }} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-8">
            {service.image_url && <img src={service.image_url} alt="" className="w-full rounded-xl object-cover" />}
            {service.body ? (
              <article className="prose prose-invert prose-lg max-w-none prose-a:text-brand-text prose-headings:font-display prose-headings:font-extrabold prose-headings:uppercase prose-headings:tracking-tight prose-li:marker:text-brand" dangerouslySetInnerHTML={safeHtml(service.body)} />
            ) : (
              <p className="text-bone-muted">More details coming soon. Call or send a confidential message to talk about your situation.</p>
            )}
            {faqs.length > 0 && (
              <div>
                <h2 className="mb-2 font-display text-[clamp(26px,4vw,38px)] font-extrabold uppercase tracking-tight">Common questions</h2>
                <FaqList faqs={faqs} />
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ConsultForm defaultCaseType="" />
          </div>
        </div>
      </Section>
    </>
  );
}
