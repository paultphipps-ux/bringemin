import { Hero, Section } from "@/components/site/blocks";
import { Seo } from "@/components/site/Seo";
import { useSections, useSiteSettings, useTeam } from "@/hooks/useContent";

export default function About() {
  const { sections } = useSections("about");
  const { data: team = [] } = useTeam();
  const s = useSiteSettings();
  return (
    <>
      <Seo title="About Our Licensed Private Investigators" description="Meet the licensed Texas private investigators behind Bring 'Em In Investigations in Dallas." />
      <Hero section={sections["about.intro"]} fallback={{ eyebrow: "About us", heading: "Licensed. Discreet. Relentless." }} />
      {s.license_number && (
        <Section title="Licensed by the State of Texas" alt>
          <div className="flex max-w-3xl flex-col gap-3 text-bone-muted">
            <p>
              Bring Em In Investigations, LLC is licensed by the Texas Department of Public Safety as a
              private investigation company, investigations/security contractor and guard company.
            </p>
            <p className="font-display text-2xl font-extrabold text-bone">License #{s.license_number}</p>
            <a href="https://www.dps.texas.gov" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-text no-underline">
              Texas Department of Public Safety →
            </a>
          </div>
        </Section>
      )}
      <Section title="The team">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <article key={m.id} className="flex flex-col gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="aspect-[4/5] w-full rounded-xl object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-[#44444B] bg-[#1E1E22] text-sm text-bone-dim">Photo coming soon</div>
              )}
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">{m.name}</h3>
              {m.title && <p className="text-bone-dim">{m.title}</p>}
              {m.license_number && <p className="text-sm text-bone-dim">Texas PI License #{m.license_number}</p>}
              {m.bio && <p className="whitespace-pre-line text-bone-muted">{m.bio}</p>}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
