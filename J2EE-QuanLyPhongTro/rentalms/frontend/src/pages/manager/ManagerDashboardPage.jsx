import { useQueries } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  getManagerBills,
  getManagerBuildings,
  getManagerMaintenance,
  getManagerRooms
} from "../../lib/managerApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero, StatusBadge, SummaryCard, statusBadgeClass } from "../owner/ownerUi.jsx";

const maintenanceStatusClasses = {
  NEW: "bg-slate-200 text-slate-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function ManagerDashboardPage() {
  const [buildingsQuery] = useQueries({
    queries: [{ queryKey: ["manager-buildings"], queryFn: getManagerBuildings }]
  });

  const buildings = buildingsQuery.data || [];

  const detailQueries = useQueries({
    queries: buildings.flatMap((building) => [
      {
        queryKey: ["manager-rooms", building.id],
        queryFn: () => getManagerRooms(building.id),
        enabled: buildings.length > 0
      },
      {
        queryKey: ["manager-maintenance", building.id],
        queryFn: () => getManagerMaintenance(building.id),
        enabled: buildings.length > 0
      },
      {
        queryKey: ["manager-bills", building.id, "ALL"],
        queryFn: () => getManagerBills(building.id),
        enabled: buildings.length > 0
      }
    ])
  });

  const isLoading = buildingsQuery.isLoading || detailQueries.some((query) => query.isLoading);
  const failed = [buildingsQuery, ...detailQueries].find((query) => query.isError);

  if (isLoading) {
    return <LoadingState label="Dang tai manager dashboard..." />;
  }

  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const rooms = [];
  const maintenance = [];
  const bills = [];
  for (let index = 0; index < detailQueries.length; index += 3) {
    rooms.push(...(detailQueries[index]?.data || []));
    maintenance.push(...(detailQueries[index + 1]?.data || []));
    bills.push(...(detailQueries[index + 2]?.data || []));
  }

  const inProgress = maintenance.filter((item) => item.status === "IN_PROGRESS");
  const unpaidBills = bills.filter((item) => item.status === "UNPAID");
  const recentMaintenance = [...maintenance]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Manager Dashboard"
        title="Tong quan van hanh duoc phan cong"
        description="Tong hop nhanh cac building duoc assign, cong to, bao tri va hoa don can manager xu ly."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Buildings" value={buildings.length} hint="So building dang duoc assign" />
        <SummaryCard label="Tong phong" value={rooms.length} hint="Tong phong manager dang theo doi" />
        <SummaryCard label="Bao tri dang xu ly" value={inProgress.length} hint="Can cap nhat tiep" />
        <SummaryCard label="Bills unpaid" value={unpaidBills.length} hint="Can doi soat thu tien" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Recent maintenance</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">5 yeu cau moi nhat</h2>

        <div className="mt-6 space-y-3">
          {recentMaintenance.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Chua co yeu cau bao tri nao.</p>
          ) : (
            recentMaintenance.map((item) => (
              <article key={item.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {item.tenantName} - Phong {item.roomNumber}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.status}
                    className={statusBadgeClass(maintenanceStatusClasses, item.status)}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                <p className="mt-3 text-sm font-semibold text-slate-500">{formatDateTime(item.createdAt)}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
