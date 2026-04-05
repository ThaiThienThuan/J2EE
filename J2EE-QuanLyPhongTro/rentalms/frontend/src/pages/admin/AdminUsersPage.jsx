import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getUsers, toggleUserActive } from "../../lib/adminApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero, StatusBadge, statusBadgeClass } from "../owner/ownerUi.jsx";

const roleClasses = {
  TENANT: "bg-emerald-100 text-emerald-700",
  OWNER: "bg-orange-100 text-orange-700",
  MANAGER: "bg-sky-100 text-sky-700",
  ADMIN: "bg-violet-100 text-violet-700"
};

export default function AdminUsersPage() {
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-users", role],
    queryFn: () => getUsers(role === "ALL" ? undefined : role)
  });

  const toggleMutation = useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] })
  });

  const filteredUsers = useMemo(
    () => (usersQuery.data || []).filter((user) => user.email?.toLowerCase().includes(search.toLowerCase())),
    [usersQuery.data, search]
  );

  if (usersQuery.isLoading) {
    return <LoadingState label="Dang tai danh sach user..." />;
  }

  if (usersQuery.isError) {
    return <ErrorState message={extractErrorMessage(usersQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero eyebrow="Users" title="Quan tri tai khoan" description="Loc theo role, tim email va khoa/mo tai khoan truc tiep tu back-office." />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="tenant-input">
            <option value="ALL">Tat ca role</option>
            <option value="TENANT">TENANT</option>
            <option value="OWNER">OWNER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="tenant-input" placeholder="Tim theo email" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <th className="pb-3">Ho ten</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Trang thai</th>
                <th className="pb-3">Tao luc</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-4">{user.fullName}</td>
                  <td className="py-4">{user.email}</td>
                  <td className="py-4">
                    <StatusBadge status={user.role} className={statusBadgeClass(roleClasses, user.role)} />
                  </td>
                  <td className="py-4">{user.active ? "Dang hoat dong" : "Da khoa"}</td>
                  <td className="py-4">{formatDateTime(user.createdAt)}</td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(user.id)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700"
                    >
                      Toggle Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {toggleMutation.isError ? <div className="mt-4"><ErrorState message={extractErrorMessage(toggleMutation.error)} /></div> : null}
      </div>
    </section>
  );
}
