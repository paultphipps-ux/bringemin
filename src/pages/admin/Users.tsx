import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { AdminHeader } from "./AdminLayout";

export default function Users() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at");
      if (error) throw error;
      return data as Profile[];
    },
  });
  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("profiles").update({ role: role || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Access updated."); qc.invalidateQueries({ queryKey: ["admin", "profiles"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <>
      <AdminHeader title="Users" subtitle="Invite people from Supabase (Authentication › Users › Invite), then give them a role here." />
      <div className="overflow-x-auto rounded-xl border border-paper-line bg-white">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-paper-line text-[13px] text-[#5E5E66]">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#EFEFEB]">
                <td className="px-4 py-3.5">{u.full_name ?? u.email ?? u.id}{u.email && u.full_name && <div className="text-sm text-[#6B6B72]">{u.email}</div>}{u.id === session?.user.id && <span className="ml-2 text-sm text-[#6B6B72]">(you)</span>}</td>
                <td className="px-4 py-3.5">
                  <select
                    aria-label={`Role for ${u.full_name ?? u.email ?? "user"}`}
                    value={u.role ?? ""}
                    disabled={u.id === session?.user.id}
                    onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                    className="min-h-10 rounded-md border border-[#D4D4CF] bg-white px-2"
                  >
                    <option value="">No access</option>
                    <option value="editor">Editor (content and blog)</option>
                    <option value="admin">Admin (everything, incl. leads)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-[#5E5E66]">Editors can manage content and the blog but can't see leads, skips, settings or users.</p>
    </>
  );
}
