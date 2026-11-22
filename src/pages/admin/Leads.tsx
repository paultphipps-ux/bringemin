import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus, SkipSubmission, SkipStatus } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { downloadCsv } from "@/components/admin/csv";
import { formatDate } from "@/lib/utils";
import { AdminHeader } from "./AdminLayout";

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "consult_booked", "retained", "lost"];
const SKIP_STATUSES: SkipStatus[] = ["new", "working", "located", "recovered", "closed"];

type Kind = "leads" | "skips";

export default function LeadsPage({ kind }: { kind: Kind }) {
  const table = kind === "leads" ? "leads" : "skip_submissions";
  const statuses = kind === "leads" ? LEAD_STATUSES : SKIP_STATUSES;
  const notesField = kind === "leads" ? "notes" : "internal_notes";
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", table, filter],
    queryFn: async () => {
      let q = supabase.from(table).select("*").order("created_at", { ascending: false }).limit(500);
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as (Lead | SkipSubmission)[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from(table).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", table] }),
    onError: (e) => toast.error((e as Error).message),
  });

  const title = kind === "leads" ? "Leads" : "Skips";
  return (
    <>
      <AdminHeader
        title={title}
        subtitle={kind === "leads" ? "Consultation requests from the website." : "Skips submitted by bail bond companies."}
        actions={<Button variant="light" onClick={() => downloadCsv(`${table}.csv`, rows as unknown as Record<string, unknown>[])}>Export CSV</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-[#E9E9E6] p-1" role="tablist" aria-label="Filter by status">
        {["all", ...statuses].map((s) => (
          <button key={s} type="button" role="tab" aria-selected={filter === s} onClick={() => setFilter(s)} className={`min-h-9 rounded-md px-3 text-sm capitalize ${filter === s ? "bg-white font-semibold" : "text-[#45454C]"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-paper-line bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper-line text-[13px] text-[#5E5E66]">
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold">{kind === "leads" ? "Name" : "Bond company / agent"}</th>
              <th className="px-4 py-3 font-semibold">{kind === "leads" ? "Case type" : "Defendant"}</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="px-4 py-6 text-[#5E5E66]" colSpan={5}>Loading…</td></tr>}
            {!isLoading && !rows.length && <tr><td className="px-4 py-6 text-[#5E5E66]" colSpan={5}>Nothing here yet.</td></tr>}
            {rows.map((r) => {
              const lead = r as Lead;
              const skip = r as SkipSubmission;
              const open = openId === r.id;
              const notes = (kind === "leads" ? lead.notes : skip.internal_notes) ?? "";
              return (
                <Fragment key={r.id}>
                  <tr className="border-b border-[#EFEFEB] align-top">
                    <td className="px-4 py-3.5 text-sm text-[#45454C]">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <button type="button" className="text-left font-semibold underline-offset-2 hover:underline" aria-expanded={open} onClick={() => setOpenId(open ? null : r.id)}>
                        {kind === "leads" ? lead.name : `${skip.bond_company} · ${skip.agent_name}`}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-[#45454C]">{kind === "leads" ? lead.case_type : skip.defendant_name}</td>
                    <td className="px-4 py-3.5 text-sm text-[#45454C]">
                      {kind === "leads" ? (
                        <>{lead.phone}{lead.email && <div>{lead.email}</div>}{lead.contact_pref && <div className="text-[#6B6B72]">Prefers {lead.contact_pref}</div>}</>
                      ) : (
                        <>{skip.agent_phone}{skip.agent_email && <div>{skip.agent_email}</div>}</>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusSelect name={kind === "leads" ? lead.name : skip.defendant_name} value={r.status} options={statuses} onChange={(v) => update.mutate({ id: r.id, patch: { status: v } })} />
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-[#EFEFEB] bg-[#FAFAF8]">
                      <td colSpan={5} className="px-4 py-4">
                        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                          {(kind === "leads"
                            ? [["Message", lead.message], ["Source page", lead.source_page], ["Campaign", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")]]
                            : [["DOB", skip.defendant_dob], ["Bond amount", skip.bond_amount], ["County", skip.county], ["Last known address", skip.last_known_address], ["Notes", skip.notes]]
                          ).map(([k, v]) => (
                            <div key={k as string}><dt className="font-semibold">{k}</dt><dd className="m-0 whitespace-pre-line text-[#45454C]">{(v as string) || "–"}</dd></div>
                          ))}
                        </dl>
                        <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
                          Internal notes
                          <textarea
                            defaultValue={notes}
                            rows={3}
                            className="rounded-md border border-[#D4D4CF] bg-white p-2.5"
                            onBlur={(e) => e.target.value !== notes && update.mutate({ id: r.id, patch: { [notesField]: e.target.value } })}
                          />
                        </label>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
