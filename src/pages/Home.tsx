import { Link } from "react-router-dom";
import { Hero, CtaLink, Section, ServiceGrid, Steps } from "@/components/site/blocks";
import { ConsultForm } from "@/components/site/ConsultForm";
import { Seo, useLocalBusinessJsonLd } from "@/components/site/Seo";
import { useSections, useServices, useSiteSettings, useTeam, useTestimonials } from "@/hooks/useContent";
import { telHref } from "@/lib/utils";

const AUDIENCES = [
  { title: "Bail bond companies", desc: "Skip tracing and fugitive recovery when a defendant misses court.", cta: "Submit a skip", to: "/bail-bond-agents" },
  { title: "Attorneys", desc: "Witness locates, surveillance and evidence that holds up in court.", cta: "Litigation support", to: "/attorneys" },
  { title: "Individuals & families", desc: "Infidelity, child custody and people locates, handled with discretion.", cta: "Talk confidentially", to: "/contact" },
  { title: "Businesses", desc: "Employee theft, fraud, due diligence and digital forensics.", cta: "Protect your company", to: "/services/corporate" },
];

export const HOW_IT_WORKS = [
  { title: "Free consultation", desc: "Call or send a confidential message. We listen, ask the right questions and tell you honestly what we can do." },
  { title: "Plan and quote", desc: "You get a written plan, a timeline and a clear price before any work starts." },
  { title: "Results and report", desc: "Photos, video and a written report, prepared so it can be used in court." },
];

export default function Home() {
  const s = useSiteSettings();
  const { sections } = useSections("home");
  const { data: services = [] } = useServices();
  const { data: testimonials = [] } = useTestimonials();
  const { data: team = [] } = useTeam();
  const jsonLd = useLocalBusinessJsonLd();
  const about = sections["home.about"];
  const contact = sections["home.contact"];

  return (
    <>
      <Seo jsonLd={jsonLd} />
      <Hero
        art
        section={sections["home.hero"]}
        fallback={{
          eyebrow: "Licensed & insured Texas private investigators · Dallas–Fort Worth",
          heading: "We find people. We find the truth. We bring 'em in.",
          body: "Fugitive recovery for bail bond companies, court-ready evidence for attorneys, and discreet investigations for families and businesses across North Texas.",
        }}
      >
        <div className="flex flex-wrap gap-3.5">
          <CtaLink to={sections["home.hero"]?.cta_href ?? "/contact"}>{sections["home.hero"]?.cta_label ?? "Free confidential consultation"}</CtaLink>
          <CtaLink to="/bail-bond-agents" variant="outline">Submit a skip</CtaLink>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm text-bone-dim">
          {s.insured && <span>Licensed &amp; insured</span>}
          {s.license_number && <span>Texas DPS License #{s.license_number}</span>}
          <span>Court-admissible reports</span>
          {s.hours && <span>{s.hours}</span>}
          <span>100% confidential</span>
        </div>
      </Hero>

      <Section title="Who we work for" id="who">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <Link key={a.title} to={a.to} className="flex flex-col gap-2.5 rounded-lg border border-ink-edge border-t-brand border-t-2 bg-ink-3 p-7 no-underline hover:border-steel-dark hover:border-t-brand">
              <span className="font-display text-xl font-extrabold uppercase tracking-tight text-bone">{a.title}</span>
              <span className="text-[15px] text-bone-muted">{a.desc}</span>
              <span className="mt-auto text-[15px] font-semibold text-brand-text">{a.cta} →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Services" intro="Every case starts with a free consultation and a written plan and quote." id="services" alt>
        <ServiceGrid services={services} />
      </Section>

      <Section title="How it works" id="how">
        <Steps steps={HOW_IT_WORKS} />
      </Section>

      <Section alt id="about" labelledBy="about-h">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="about-h" className="font-display text-[clamp(26px,4vw,38px)] font-extrabold uppercase tracking-tight">{about?.heading ?? "Who we are"}</h2>
            {about?.body && <p className="whitespace-pre-line text-bone-muted">{about.body}</p>}
            <Link to={about?.cta_href ?? "/about"} className="font-semibold text-brand-text no-underline">{about?.cta_label ?? "Meet the team"} →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {team.slice(0, 2).map((m) =>
              m.photo_url ? (
                <img key={m.id} src={m.photo_url} alt={m.name} className="aspect-[4/5] w-full rounded-xl object-cover" loading="lazy" />
              ) : (
                <div key={m.id} className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-[#44444B] bg-[#1E1E22] p-3 text-center text-sm text-bone-dim">{m.name}</div>
              ),
            )}
          </div>
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section title="What clients say" id="reviews">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 6).map((t) => (
              <figure key={t.id} className="m-0 flex flex-col gap-3.5 rounded-xl border border-ink-edge bg-ink-3 p-7">
                <blockquote className="m-0 text-[17px]">“{t.quote}”</blockquote>
                <figcaption className="text-sm text-bone-dim">{t.author}{t.context ? `, ${t.context}` : ""}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <section id="contact" aria-labelledby="contact-h" className="bg-ink-2">
        <div className="container grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <div className="flex flex-col gap-4">
            <h2 id="contact-h" className="font-display text-[clamp(26px,4vw,38px)] font-extrabold uppercase tracking-tight">{contact?.heading ?? "Free confidential consultation"}</h2>
            {contact?.body && <p className="text-bone-muted">{contact.body}</p>}
            <a href={telHref(s.phone)} className="font-display text-3xl font-semibold no-underline">{s.phone}</a>
            <p className="text-[15px] text-bone-dim">{[s.hours, s.service_area].filter(Boolean).join(" · ")}</p>
          </div>
          <ConsultForm />
        </div>
      </section>
    </>
  );
}
