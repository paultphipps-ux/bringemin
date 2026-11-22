import { cn } from "@/lib/utils";

export const pill: Record<string, string> = {
  new: "bg-[#FBEBEB] text-[#A50E26]",
  contacted: "bg-[#E6EEF9] text-[#1F4E8C]",
  working: "bg-[#E6EEF9] text-[#1F4E8C]",
  consult_booked: "bg-[#F9EEDA] text-[#7A4A00]",
  located: "bg-[#F9EEDA] text-[#7A4A00]",
  retained: "bg-[#E3F2E5] text-[#1D6B2C]",
  recovered: "bg-[#E3F2E5] text-[#1D6B2C]",
  lost: "bg-[#EFEFEB] text-[#45454C]",
  closed: "bg-[#EFEFEB] text-[#45454C]",
  draft: "bg-[#EFEFEB] text-[#45454C]",
  scheduled: "bg-[#E6EEF9] text-[#1F4E8C]",
  published: "bg-[#E3F2E5] text-[#1D6B2C]",
};

export const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusPill({ status }: { status: string }) {
  return <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-semibold", pill[status])}>{label(status)}</span>;
}

export function StatusSelect({ value, options, onChange, name }: { value: string; options: string[]; onChange: (v: string) => void; name: string }) {
  return (
    <select
      aria-label={`Status for ${name}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("min-h-9 rounded-full border-0 px-3 text-[13px] font-semibold", pill[value])}
    >
      {options.map((o) => (
        <option key={o} value={o}>{label(o)}</option>
      ))}
    </select>
  );
}
