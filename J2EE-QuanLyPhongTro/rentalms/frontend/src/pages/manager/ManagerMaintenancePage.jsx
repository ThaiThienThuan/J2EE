import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  getManagerBuildings,
  getManagerMaintenance,
  updateMaintenanceStatus
} from "../../lib/managerApi";
import { formatDateTime } from "../../lib/format";
import { OwnerHero, StatusBadge, statusBadgeClass } from "../owner/ownerUi.jsx";

const maintenanceStatusClasses = {
  NEW: "bg-slate-200 text-slate-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function ManagerMaintenancePage() {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const queryClient = useQueryClient();

  const buildingsQuery = useQuery({
    queryKey: ["manager-buildings"],
    queryFn: getManagerBuildings
  });

  useEffect(() => {
    if (!selectedBuilding && (buildingsQuery.data || []).length > 0) {
      setSelectedBuilding(String(buildingsQuery.data[0].id));
    }
  }, [buildingsQuery.data, selectedBuilding]);

  const maintenanceQuery = useQuery({
    queryKey: ["manager-maintenance", selectedBuilding],
    queryFn: () => getManagerMaintenance(selectedBuilding),
    enabled: Boolean(selectedBuilding)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => updateMaintenanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-maintenance", selectedBuilding] });
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    }
  });

  if (buildingsQuery.isLoading || maintenanceQuery.isLoading) {
    return <LoadingState label="Dang tai bao tri..." />;
  }

  const failed = [buildingsQuery, maintenanceQuery].find((query) => query.isError);
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const actionsFor = (item) => {
    if (item.status === "NEW") {
      return [{ label: "Bat dau xu ly", status: "IN_PROGRESS", className: "bg-brand-orange text-white" }];
    }
    if (item.status === "IN_PROGRESS") {
      return [
        { label: "Hoan thanh", status: "DONE", className: "bg-emerald-600 text-white" },
        { label: "Huy", status: "CANCELLED", className: "bg-red-600 text-white" }
      ];
    }
    return [];
  };

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Maintenance"
        title="Xu ly yeu cau bao tri"
        description="Manager cap nhat yeu cau theo state machine NEW -> IN_PROGRESS -> DONE/CANCELLED."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-extrabold text-slate-700">Building</label>
          <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="tenant-input">
            {(buildingsQuery.data || []).map((building) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {(maintenanceQuery.data || []).map((item) => (
            <article key={item.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {item.tenantName} - Phong {item.roomNumber}
                  </p>
                </div>
                <StatusBadge status={item.status} className={statusBadgeClass(maintenanceStatusClasses, item.status)} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">{formatDateTime(item.createdAt)}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {actionsFor(item).map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => updateMutation.mutate({ id: item.id, status: action.status })}
                    className={`rounded-xl px-4 py-2 text-sm font-extrabold ${action.className}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        {updateMutation.isError ? <div className="mt-4"><ErrorState message={extractErrorMessage(updateMutation.error)} /></div> : null}
      </div>
    </section>
  );
}
