import { Link } from "react-router-dom";

/** Header lockup: reaper mark + wordmark, light-on-dark versions. Source art: public/brand/. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="Bring 'Em In Investigations, home">
      <img src="/brand/mark-dark-bg.png" alt="" width={512} height={365} className="h-11 w-auto sm:h-12" />
      {!compact && (
        <img
          src="/brand/wordmark-dark-bg.png"
          alt="Bring 'Em In Investigations"
          width={800}
          height={151}
          className="hidden h-8 w-auto min-[380px]:block sm:h-9"
        />
      )}
    </Link>
  );
}

export function FullLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-full-dark-bg.png"
      alt="Bring 'Em In Investigations"
      width={900}
      height={594}
      className={className}
    />
  );
}
