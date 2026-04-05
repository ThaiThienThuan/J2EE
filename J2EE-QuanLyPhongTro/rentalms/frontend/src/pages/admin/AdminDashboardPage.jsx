import { useQueries } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getAuditLogs, getUsers } from "../../lib/adminApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero, SummaryCard } from "../owner/ownerUi.jsx";

export default function AdminDashboardPage() {
  const [usersQuery, auditQuery] = useQueries({
    queries: [
      { queryKey: ["admin-users", "ALL"], queryFn: () => getUsers() },
      { queryKey: ["admin-audit-logs", "dashboard"], queryFn: () => getAuditLogs({ page: 0, size: 20 }) }
    ]
  });

  if (usersQuery.isLoading || auditQuery.isLoading) {
    return <LoadingState label="Dang tai admin dashboard..." />;
  }

  const failed = [usersQuery, auditQuery].find((query) => query.isError);
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const users = usersQuery.data || [];
  const auditLogs = auditQuery.data?.content || auditQuery.data || [];

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Admin Dashboard"
        title="Tong quan back-office"
        description="Tong hop nhanh user counts va nhat ky hoat dong moi nhat cua he thong."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Tong users" value={users.length} />
        <SummaryCard label="Tenants" value={users.filter((user) => user.role === "TENANT").length} />
        <SummaryCard label="Owners" value={users.filter((user) => user.role === "OWNER").length} />
        <SummaryCard label="Managers" value={users.filter((user) => user.role === "MANAGER").length} />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Recent audit</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">5 log moi nhat</h2>
        <div className="mt-6 space-y-3">
          {auditLogs.slice(0, 5).map((log) => (
            <article key={log.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="font-extrabold text-slate-900">{log.action} - {log.entityType}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{log.actorEmail || "System"}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{log.description}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">{formatDateTime(log.createdAt || log.timestamp)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
