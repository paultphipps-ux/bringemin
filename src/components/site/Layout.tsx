import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import { FullLogo, Logo } from "./Logo";
import { useSiteSettings } from "@/hooks/useContent";
import { buttonClass } from "@/components/ui/button";
import { captureAttribution, cn, telHref } from "@/lib/utils";

const NAV = [
  { to: "/services", label: "Services" },
  { to: "/bail-bond-agents", label: "Bail Bond Agents" },
  { to: "/attorneys", label: "Attorneys" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const s = useSiteSettings();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => captureAttribution(), []);
  useEffect(() => {
    setOpen(false);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="min-h-screen bg-ink font-sans text-[17px] leading-relaxed text-bone">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-4 py-4">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 text-[15px] font-medium lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cn("no-underline hover:text-brand-text", isActive && "text-brand-text")}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={telHref(s.phone)} className={buttonClass("primary", "hidden sm:inline-flex")}>
              <Phone size={18} aria-hidden /> {s.phone}
            </a>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-edge lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobile" className="border-t border-ink-line lg:hidden">
            <div className="container flex flex-col py-2">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className="py-3 text-lg no-underline">
                  {n.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-ink-line">
        <div className="container flex flex-wrap justify-between gap-8 py-10 text-sm text-bone-dim">
          <div className="flex flex-col gap-1.5">
            <FullLogo className="mb-2 h-auto w-44" />
            {s.license_number && <span>Texas PI License #{s.license_number}</span>}
            <span>{s.service_area}</span>
            <a href={telHref(s.phone)} className="text-bone no-underline">{s.phone}</a>
            {s.email && <a href={`mailto:${s.email}`} className="text-bone no-underline">{s.email}</a>}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="no-underline hover:text-bone">{n.label}</Link>
            ))}
            <Link to="/faq" className="no-underline hover:text-bone">FAQ</Link>
            <Link to="/privacy" className="no-underline hover:text-bone">Privacy</Link>
          </nav>
        </div>
        <div className="container pb-24 text-xs text-bone-dim sm:pb-8">© {new Date().getFullYear()} {s.business_name}. All rights reserved.</div>
      </footer>

      {/* Sticky call/consult bar on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-ink-line bg-ink sm:hidden">
        <a href={telHref(s.phone)} className="flex min-h-[56px] items-center justify-center gap-2 font-semibold no-underline">
          <Phone size={18} aria-hidden /> Call
        </a>
        <Link to="/contact" className="flex min-h-[56px] items-center justify-center bg-brand font-semibold text-white no-underline">
          Free consult
        </Link>
      </div>
    </div>
  );
}
