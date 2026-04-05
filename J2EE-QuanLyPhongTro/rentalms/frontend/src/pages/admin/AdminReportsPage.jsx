import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getReports } from "../../lib/adminApi";
import { formatMoney } from "../../lib/format";
import { OwnerHero, SummaryCard } from "../owner/ownerUi.jsx";

export default function AdminReportsPage() {
  const reportsQuery = useQuery({
    queryKey: ["admin-reports"],
    queryFn: getReports
  });

  if (reportsQuery.isLoading) {
    return <LoadingState label="Dang tai reports..." />;
  }

  if (reportsQuery.isError) {
    return <ErrorState message={extractErrorMessage(reportsQuery.error)} />;
  }

  const report = reportsQuery.data || {};
  const rooms = report.rooms || {};
  const contracts = report.contracts || {};
  const currentMonth = report.currentMonth || {};

  return (
    <section className="space-y-6">
      <OwnerHero eyebrow="Reports" title="Bao cao tong hop" description="Dung overview report hien co de render summary cards va bang don gian, khong can chart phuc tap." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Tong phong" value={rooms.total || 0} />
        <SummaryCard label="Ty le lap day" value={`${rooms.occupancyRate || 0}%`} />
        <SummaryCard label="Contracts active" value={contracts.active || 0} />
        <SummaryCard label="Overdue debt" value={formatMoney(report.overdueDebt)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl font-bold text-slate-900">Doanh thu thang hien tai</h2>
          <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
            <p><strong>Thuc thu:</strong> {formatMoney(currentMonth.actual)}</p>
            <p><strong>Ky vong:</strong> {formatMoney(currentMonth.expected)}</p>
            <p><strong>Ti le thu:</strong> {currentMonth.collectionRate || 0}%</p>
            <p><strong>Chi phi bao tri:</strong> {formatMoney(report.maintenanceCost)}</p>
            <p><strong>Loi nhuan rong:</strong> {formatMoney(report.netProfit)}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl font-bold text-slate-900">Hop dong va phong</h2>
          <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
            <p><strong>Phong dang thue:</strong> {rooms.occupied || 0}</p>
            <p><strong>Phong trong:</strong> {rooms.available || 0}</p>
            <p><strong>Phong bao tri:</strong> {rooms.maintenance || 0}</p>
            <p><strong>Hop dong moi thang nay:</strong> {contracts.newThisMonth || 0}</p>
            <p><strong>Hop dong ket thuc thang nay:</strong> {contracts.terminatedThisMonth || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
