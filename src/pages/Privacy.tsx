import { Hero, Section } from "@/components/site/blocks";
import { Seo } from "@/components/site/Seo";

export default function Privacy() {
  return (
    <>
      <Seo title="Privacy Policy" />
      <Hero fallback={{ heading: "Privacy policy" }} />
      <Section>
        <div className="prose prose-invert max-w-3xl">
          <p>[Privacy policy text to be provided by the client or their attorney. It should cover what the contact and skip forms collect, how it is stored, who can see it, and how long it is kept.]</p>
        </div>
      </Section>
    </>
  );
}
