import { Link } from "react-router-dom";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex flex-col leading-none no-underline" aria-label="Bring 'Em In Investigations, home">
      <span className="font-display text-[26px] font-bold tracking-wide text-bone">
        BRING ’EM <span className="text-brand">IN</span>
      </span>
      {!compact && <span className="mt-1 text-[11px] tracking-[0.3em] text-bone-dim">INVESTIGATIONS · DALLAS, TX</span>}
    </Link>
  );
}
