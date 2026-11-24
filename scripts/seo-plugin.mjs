// Vite plugin: after every production build, write sitemap.xml and a prerendered
// HTML file per public route (title, description, canonical, Open Graph, JSON-LD and
// the page's main text inside #root). Search engines and link previews read these
// without running JavaScript; React replaces #root as soon as the app loads.
// Runs inside `vite build`, so it works on any host that builds with Vite (Lovable included).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const SITE = "https://bringemininvestigations.com";
const BRAND = "Bring 'Em In Investigations";
const DEFAULT_TITLE = `${BRAND} | Licensed Private Investigators in Dallas, TX`;
const DEFAULT_DESC =
  "Licensed and insured Texas private investigators in Dallas–Fort Worth: fugitive recovery and skip tracing for bail bond companies, litigation support for attorneys, and discreet investigations for families and businesses.";

// Keep in step with the <Seo> props in src/pages.
const STATIC = [
  { path: "/", title: DEFAULT_TITLE, h1: "We find people. We find the truth. We bring 'em in.", desc: DEFAULT_DESC },
  { path: "/services", title: "Private Investigation Services in Dallas, TX", desc: "Fugitive recovery, skip tracing, surveillance, infidelity, child custody, background checks, asset searches, digital forensics and corporate investigations in Dallas–Fort Worth." },
  { path: "/bail-bond-agents", title: "Skip Tracing & Fugitive Recovery for Bail Bond Companies", h1: "Your defendant skipped. We bring 'em in.", desc: "Licensed Texas investigators handling skip tracing and fugitive recovery for bail bond companies across Dallas–Fort Worth. Submit a skip online or call 24/7." },
  { path: "/attorneys", title: "Litigation Support Investigations for Attorneys in Dallas", h1: "Investigations that hold up in court.", desc: "Witness locates, surveillance, asset searches and digital forensics for Dallas–Fort Worth law firms, documented in court-ready reports." },
  { path: "/about", title: "About Our Licensed Private Investigators", desc: "Meet the licensed Texas private investigators behind Bring 'Em In Investigations in Dallas." },
  { path: "/faq", title: "Private Investigator FAQ", desc: "Answers about cost, legality, confidentiality and timelines when hiring a private investigator in Texas." },
  { path: "/contact", title: "Free Confidential Consultation", desc: "Talk to a licensed Dallas private investigator. Free, confidential consultation by phone or online, 24/7." },
  { path: "/blog", title: "Blog", desc: "Articles from licensed Dallas private investigators on bail recovery, family cases, legal matters and protecting your business." },
  { path: "/privacy", title: "Privacy Policy", desc: DEFAULT_DESC },
];

const esc = (s = "") =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const full = (t) => (t.includes(BRAND) ? t : `${t} | ${BRAND}`);
// Bodies come from our own database (staff-only writes), but strip scripts and inline handlers anyway.
const clean = (html) =>
  String(html ?? "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "");

function supabaseConfig(env) {
  const ok = (v) => (v && !v.includes("YOUR-") ? v : undefined);
  let file = {};
  try {
    file = JSON.parse(readFileSync("supabase.config.json", "utf8"));
  } catch {
    /* no config file */
  }
  return { url: ok(env.VITE_SUPABASE_URL) ?? ok(file.url), key: ok(env.VITE_SUPABASE_ANON_KEY) ?? ok(file.anonKey) };
}

async function loadContent({ url, key }) {
  if (!url || !key) return null;
  const get = async (p) => {
    const res = await fetch(`${url}/rest/v1/${p}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`${p}: ${res.status}`);
    return res.json();
  };
  const now = new Date().toISOString();
  const [settings, services, posts, categories] = await Promise.all([
    get("site_settings?select=*&id=eq.1"),
    get("services?select=slug,name,summary,body,seo_title,seo_description,image_url,updated_at&published=eq.true&order=sort"),
    get(
      `posts?select=slug,title,excerpt,body,seo_title,seo_description,cover_image,og_image,published_at,updated_at&status=in.(published,scheduled)&published_at=lte.${now}`,
    ),
    get("categories?select=slug,name"),
  ]);
  return { settings: settings[0] ?? {}, services, posts, categories };
}

function render(template, { path: p, title, desc, image, type = "website", jsonLd, body }) {
  const url = SITE + p;
  const head = [
    `<title>${esc(full(title))}</title>`,
    `<meta data-rh="true" name="description" content="${esc(desc)}" />`,
    `<link data-rh="true" rel="canonical" href="${url}" />`,
    `<meta data-rh="true" property="og:title" content="${esc(full(title))}" />`,
    `<meta data-rh="true" property="og:description" content="${esc(desc)}" />`,
    `<meta data-rh="true" property="og:type" content="${type}" />`,
    `<meta data-rh="true" property="og:url" content="${url}" />`,
    `<meta data-rh="true" property="og:image" content="${esc(image || SITE + "/brand/logo-full-light-bg.png")}" />`,
    jsonLd ? `<script data-rh="true" type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  return template
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace(/\s*<meta name="description"[^>]*>/, "")
    .replace('<div id="root"></div>', `<div id="root"><main class="container prose prose-invert py-20">${body}</main></div>`);
}

const serviceLinks = (services) =>
  services.length
    ? `<nav aria-label="Services"><ul>${services.map((s) => `<li><a href="/services/${s.slug}">${esc(s.name)}</a></li>`).join("")}</ul></nav>`
    : "";

export default function seoPlugin() {
  let outDir = "dist";
  let env = {};
  return {
    name: "bringem-seo",
    apply: "build",
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
      env = { ...cfg.env, ...process.env };
    },
    async closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!existsSync(indexPath)) return;
      const template = readFileSync(indexPath, "utf8");
      // Unknown URLs (old WordPress links, etc.) get the plain app shell via the host's SPA fallback.
      writeFileSync(path.join(outDir, "404.html"), template);

      let data = null;
      try {
        data = await loadContent(supabaseConfig(env));
        if (!data) console.warn("prerender: Supabase not configured (supabase.config.json); prerendering static pages only.");
      } catch (e) {
        console.warn(`prerender: could not load content from Supabase (${e.message}); prerendering static pages only.`);
      }
      const services = data?.services ?? [];
      const s = data?.settings ?? {};
      const business = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: s.business_name ?? BRAND,
        url: SITE,
        telephone: s.phone ?? undefined,
        email: s.email ?? undefined,
        areaServed: s.service_area ?? "Dallas–Fort Worth, TX",
        address: { "@type": "PostalAddress", addressLocality: "Dallas", addressRegion: "TX", addressCountry: "US" },
      };

      const pages = STATIC.map((p) => ({
        ...p,
        jsonLd: p.path === "/" ? business : undefined,
        body: `<h1>${esc(p.h1 ?? p.title)}</h1><p>${esc(p.desc)}</p>${p.path === "/" || p.path === "/services" ? serviceLinks(services) : ""}`,
      }));
      for (const sv of services) {
        pages.push({
          path: `/services/${sv.slug}`,
          title: sv.seo_title ?? `${sv.name} in Dallas, TX`,
          desc: sv.seo_description ?? sv.summary ?? DEFAULT_DESC,
          image: sv.image_url,
          lastmod: sv.updated_at,
          jsonLd: { "@context": "https://schema.org", "@type": "Service", name: sv.name, description: sv.summary, areaServed: "Dallas–Fort Worth, TX", provider: business },
          body: `<h1>${esc(sv.name)}</h1><p>${esc(sv.summary)}</p>${clean(sv.body)}`,
        });
      }
      for (const po of data?.posts ?? []) {
        pages.push({
          path: `/blog/${po.slug}`,
          title: po.seo_title ?? po.title,
          desc: po.seo_description ?? po.excerpt ?? DEFAULT_DESC,
          type: "article",
          image: po.og_image ?? po.cover_image,
          lastmod: po.updated_at,
          jsonLd: { "@context": "https://schema.org", "@type": "BlogPosting", headline: po.title, datePublished: po.published_at, dateModified: po.updated_at, publisher: { "@type": "Organization", name: BRAND } },
          body: `<article><h1>${esc(po.title)}</h1>${clean(po.body)}</article>`,
        });
      }
      for (const c of data?.categories ?? []) {
        pages.push({
          path: `/blog/category/${c.slug}`,
          title: `${c.name} articles`,
          desc: `Articles on ${String(c.name).toLowerCase()} from licensed Dallas private investigators.`,
          body: `<h1>${esc(c.name)} articles</h1>`,
        });
      }

      for (const p of pages) {
        const file = p.path === "/" ? indexPath : path.join(outDir, p.path.slice(1), "index.html");
        mkdirSync(path.dirname(file), { recursive: true });
        const html = render(template, p);
        writeFileSync(file, html);
        // Hosts differ on whether /foo serves foo/index.html or foo.html, so write both.
        if (p.path !== "/") writeFileSync(path.join(outDir, `${p.path.slice(1)}.html`), html);
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
        .filter((p) => p.path !== "/privacy")
        .map((p) => `  <url><loc>${SITE}${p.path}</loc>${p.lastmod ? `<lastmod>${String(p.lastmod).slice(0, 10)}</lastmod>` : ""}</url>`)
        .join("\n")}\n</urlset>\n`;
      writeFileSync(path.join(outDir, "sitemap.xml"), xml);
      console.log(`prerender: ${pages.length} pages + sitemap.xml`);
    },
  };
}
