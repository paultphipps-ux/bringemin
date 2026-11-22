import { FaqList, Hero, Section } from "@/components/site/blocks";
import { Seo } from "@/components/site/Seo";
import { useFaqs } from "@/hooks/useContent";

export default function Faq() {
  const { data: faqs = [] } = useFaqs("faq");
  return (
    <>
      <Seo
        title="Private Investigator FAQ"
        description="Answers about cost, confidentiality, legality and timelines when hiring a private investigator in Dallas."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
      <Hero fallback={{ eyebrow: "FAQ", heading: "Questions people ask us" }} />
      <Section>
        <div className="max-w-3xl"><FaqList faqs={faqs} /></div>
      </Section>
    </>
  );
}
