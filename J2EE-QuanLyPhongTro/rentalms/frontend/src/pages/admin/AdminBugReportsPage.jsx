import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getBugReports, markNotificationRead } from "../../lib/adminApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero } from "../owner/ownerUi.jsx";

export default function AdminBugReportsPage() {
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const bugReportsQuery = useQuery({
    queryKey: ["admin-bug-reports"],
    queryFn: getBugReports
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bug-reports"] })
  });

  if (bugReportsQuery.isLoading) {
    return <LoadingState label="Dang tai bug reports..." />;
  }

  if (bugReportsQuery.isError) {
    return <ErrorState message={extractErrorMessage(bugReportsQuery.error)} />;
  }

  const reports = bugReportsQuery.data || [];

  return (
    <section className="space-y-6">
      <OwnerHero eyebrow="Bug Reports" title="Phan anh loi tu nguoi dung" description="Danh sach bug reports gui vao he thong notifications, co the mark read khi mo chi tiet." />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="space-y-3">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => {
                  setSelected(report);
                  if (!report.read) {
                    markReadMutation.mutate(report.id);
                  }
                }}
                className="w-full rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-left"
              >
                <p className="font-extrabold text-slate-900">{report.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatDateTime(report.createdAt)}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{report.message}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          {selected ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Chi tiet</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">{selected.title}</h2>
              <p className="mt-3 text-sm font-semibold text-slate-500">{formatDateTime(selected.createdAt)}</p>
              <pre className="mt-6 whitespace-pre-wrap rounded-[20px] bg-slate-50 p-4 text-sm leading-7 text-slate-700">{selected.message}</pre>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-500">Chon mot bug report de xem chi tiet.</p>
          )}
        </div>
      </div>

      {markReadMutation.isError ? <ErrorState message={extractErrorMessage(markReadMutation.error)} /> : null}
    </section>
  );
}
