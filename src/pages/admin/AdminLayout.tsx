import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/leads", label: "Leads", adminOnly: true },
  { to: "/admin/skips", label: "Skips", adminOnly: true },
  { to: "/admin/posts", label: "Blog posts" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/pages", label: "Page content" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/team", label: "Team" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/media", label: "Media library" },
  { to: "/admin/settings", label: "Site settings", adminOnly: true },
  { to: "/admin/users", label: "Users", adminOnly: true },
];

export default function AdminLayout() {
  const { session, profile, loading, isAdmin, isStaff, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-10 font-sans text-[#5E5E66]">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-start gap-4 bg-paper p-10 font-sans text-[#1D1D20]">
        <h1 className="text-2xl font-semibold">No admin access yet</h1>
        <p>You're signed in as {session.user.email}, but an admin hasn't given this account access. Ask the site owner to grant it under Users.</p>
        <button type="button" className="underline" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-wrap bg-paper font-sans text-[15px] text-[#1D1D20]">
      <Helmet><title>Admin | Bring 'Em In</title><meta name="robots" content="noindex" /></Helmet>
      <aside className="flex w-full flex-col gap-1 bg-ink px-4 py-6 text-[#E6E6E8] md:w-60 md:min-h-screen">
        <div className="px-2.5 pb-5 leading-none">
          <span className="font-display text-[22px] font-bold text-bone">BRING ’EM <span className="text-brand-text">IN</span></span>
          <div className="mt-1.5 text-[11px] tracking-[0.25em] text-bone-dim">ADMIN</div>
        </div>
        <nav aria-label="Admin" className="flex flex-row flex-wrap gap-1 md:flex-col">
          {NAV.filter((n) => !n.adminOnly || isAdmin).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/admin"}
              className={({ isActive }) => cn("flex min-h-10 items-center rounded-md px-2.5 text-sm no-underline", isActive ? "bg-[#26262B] font-semibold text-white" : "text-bone-muted hover:text-white")}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 px-2.5 pt-6 text-xs text-bone-dim">
          <span>{profile?.full_name ?? session.user.email}</span>
          <span className="capitalize">{profile?.role}</span>
          <a href="/" target="_blank" rel="noreferrer" className="text-bone-muted">View site ↗</a>
          <button type="button" onClick={signOut} className="self-start text-bone-muted underline">Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-[999_1_560px] px-5 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-[#5E5E66]">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
