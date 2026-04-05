import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getManagerBuildings } from "../../lib/managerApi";
import { OwnerHero, StatusBadge, statusBadgeClass } from "../owner/ownerUi.jsx";

const publishClasses = {
  PUBLIC: "bg-emerald-100 text-emerald-700",
  PRIVATE: "bg-slate-200 text-slate-700"
};

export default function ManagerBuildingsPage() {
  const buildingsQuery = useQuery({
    queryKey: ["manager-buildings"],
    queryFn: getManagerBuildings
  });

  if (buildingsQuery.isLoading) {
    return <LoadingState label="Dang tai buildings duoc assign..." />;
  }

  if (buildingsQuery.isError) {
    return <ErrorState message={extractErrorMessage(buildingsQuery.error)} />;
  }

  const buildings = buildingsQuery.data || [];

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="My Buildings"
        title="Danh sach building duoc assign"
        description="Manager chi nhin thay cac building active assignment va dieu huong nhanh sang trang phong."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {buildings.map((building) => (
          <article key={building.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Building</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">{building.name}</h2>
                <p className="mt-3 text-sm font-semibold text-slate-500">{building.address}</p>
              </div>
              <StatusBadge
                status={building.publishStatus}
                className={statusBadgeClass(publishClasses, building.publishStatus)}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/manager/rooms?buildingId=${building.id}`}
                className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white"
              >
                Xem phong
              </Link>
              <Link
                to={`/manager/maintenance?buildingId=${building.id}`}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700"
              >
                Bao tri
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
