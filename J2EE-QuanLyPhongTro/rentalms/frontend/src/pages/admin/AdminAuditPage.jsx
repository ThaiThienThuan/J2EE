import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getAuditLogs } from "../../lib/adminApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero } from "../owner/ownerUi.jsx";

const PAGE_SIZE = 20;

export default function AdminAuditPage() {
  const [filters, setFilters] = useState({ action: "", entityType: "", from: "", to: "" });
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: () =>
      getAuditLogs({
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        from: filters.from ? `${filters.from}T00:00:00` : undefined,
        to: filters.to ? `${filters.to}T23:59:59` : undefined,
        page: 0,
        size: 200
      })
  });

  const allLogs = auditQuery.data?.content || auditQuery.data || [];
  const pageCount = Math.max(1, Math.ceil(allLogs.length / PAGE_SIZE));
  const visibleLogs = useMemo(() => allLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allLogs, page]);

  if (auditQuery.isLoading) {
    return <LoadingState label="Dang tai audit logs..." />;
  }

  if (auditQuery.isError) {
    return <ErrorState message={extractErrorMessage(auditQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero eyebrow="Audit" title="Nhat ky he thong" description="Loc theo action, entity va khoang ngay; phan trang client-side 20 dong moi trang." />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-4">
          <input value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }} className="tenant-input" placeholder="Action" />
          <input value={filters.entityType} onChange={(e) => { setFilters({ ...filters, entityType: e.target.value }); setPage(1); }} className="tenant-input" placeholder="Entity" />
          <input type="date" value={filters.from} onChange={(e) => { setFilters({ ...filters, from: e.target.value }); setPage(1); }} className="tenant-input" />
          <input type="date" value={filters.to} onChange={(e) => { setFilters({ ...filters, to: e.target.value }); setPage(1); }} className="tenant-input" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">Entity ID</th>
                <th className="pb-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {visibleLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-4">{formatDateTime(log.createdAt || log.timestamp)}</td>
                  <td className="py-4">{log.actorEmail || "System"}</td>
                  <td className="py-4">{log.action}</td>
                  <td className="py-4">{log.entityType}</td>
                  <td className="py-4">{log.entityId}</td>
                  <td className="py-4">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700">
            Trang truoc
          </button>
          <p className="text-sm font-bold text-slate-500">Trang {page}/{pageCount}</p>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700">
            Trang sau
          </button>
        </div>
      </div>
    </section>
  );
}
