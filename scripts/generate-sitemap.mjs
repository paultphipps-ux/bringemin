// Writes public/sitemap.xml from the live Supabase content (services + published posts).
// Runs automatically before `npm run build`. Skips quietly if env vars are missing.
import { writeFileSync, existsSync, readFileSync } from "node:fs";

const SITE = "https://bringemininvestigations.com";
const STATIC = ["/", "/services", "/bail-bond-agents", "/attorneys", "/about", "/faq", "/contact", "/blog", "/privacy"];

function env(name) {
  if (process.env[name]) return process.env[name];
  for (const f of [".env.local", ".env"]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
    if (m) return m[1].trim();
  }
}

const url = env("VITE_SUPABASE_URL");
const key = env("VITE_SUPABASE_ANON_KEY");
let dynamic = [];

if (url && key && !url.includes("YOUR-PROJECT")) {
  const get = async (path) => {
    const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  };
  try {
    const now = new Date().toISOString();
    const [services, posts, categories] = await Promise.all([
      get("services?select=slug,updated_at&published=eq.true"),
      get(`posts?select=slug,updated_at&status=in.(published,scheduled)&published_at=lte.${now}`),
      get("categories?select=slug"),
    ]);
    dynamic = [
      ...services.map((s) => ({ loc: `/services/${s.slug}`, lastmod: s.updated_at })),
      ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updated_at })),
      ...categories.map((c) => ({ loc: `/blog/category/${c.slug}` })),
    ];
  } catch (e) {
    console.warn("sitemap: could not load dynamic URLs:", e.message);
  }
} else {
  console.warn("sitemap: Supabase env vars not set; writing static pages only.");
}

const entries = [...STATIC.map((loc) => ({ loc })), ...dynamic];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${SITE}${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
writeFileSync("public/sitemap.xml", xml);
console.log(`sitemap: ${entries.length} URLs`);
