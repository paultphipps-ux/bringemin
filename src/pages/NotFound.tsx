import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-start gap-4 py-28">
      <Seo title="Page not found" />
      <h1 className="font-display text-5xl font-bold">Page not found</h1>
      <p className="text-bone-muted">That page moved or no longer exists.</p>
      <Link to="/" className="font-semibold text-brand-text no-underline">Back to home →</Link>
    </div>
  );
}
