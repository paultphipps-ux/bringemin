import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useContent";

const SITE = "https://bringemininvestigations.com";

interface Props {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
}

export function Seo({ title, description, image, type = "website", jsonLd }: Props) {
  const s = useSiteSettings();
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ${s.business_name}` : s.default_seo_title ?? s.business_name;
  const desc = description ?? s.default_seo_description ?? "";
  const url = SITE + pathname;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

export function useLocalBusinessJsonLd() {
  const s = useSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: s.business_name,
    telephone: s.phone,
    email: s.email ?? undefined,
    url: SITE,
    areaServed: s.service_area ?? "Dallas–Fort Worth, TX",
    address: { "@type": "PostalAddress", addressLocality: "Dallas", addressRegion: "TX", addressCountry: "US" },
    sameAs: [s.facebook_url, s.instagram_url, s.linkedin_url, s.google_business_url].filter(Boolean),
  };
}
