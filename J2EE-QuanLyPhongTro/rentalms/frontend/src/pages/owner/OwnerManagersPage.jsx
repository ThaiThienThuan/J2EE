import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  assignManager,
  getAvailableManagers,
  getBuildingManagers,
  getOwnerBuildings,
  unassignManager
} from "../../lib/ownerApi";
import { getInitials } from "../../lib/format";
import { OwnerHero } from "./ownerUi.jsx";

export default function OwnerManagersPage() {
  const [openId, setOpenId] = useState(null);
  const [searchByBuilding, setSearchByBuilding] = useState({});
  const [pickedByBuilding, setPickedByBuilding] = useState({});
  const queryClient = useQueryClient();

  const buildingsQuery = useQuery({
    queryKey: ["owner-buildings"],
    queryFn: getOwnerBuildings
  });

  const managerQueries = useQueries({
    queries: (buildingsQuery.data || []).map((building) => ({
      queryKey: ["owner-building-managers", building.id],
      queryFn: () => getBuildingManagers(building.id),
      enabled: Boolean(buildingsQuery.data)
    }))
  });

  const availableManagersQuery = useQuery({
    queryKey: ["owner-available-managers"],
    queryFn: getAvailableManagers,
    enabled: Boolean(openId)
  });

  const managersByBuildingId = useMemo(
    () =>
      Object.fromEntries(
        (buildingsQuery.data || []).map((building, index) => [building.id, managerQueries[index]?.data || []])
      ),
    [buildingsQuery.data, managerQueries]
  );

  const assignMutation = useMutation({
    mutationFn: ({ buildingId, managerId }) => assignManager(buildingId, Number(managerId)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owner-building-managers", variables.buildingId] });
      setPickedByBuilding((current) => ({ ...current, [variables.buildingId]: null }));
      setSearchByBuilding((current) => ({ ...current, [variables.buildingId]: "" }));
    }
  });

  const unassignMutation = useMutation({
    mutationFn: ({ buildingId, managerId }) => unassignManager(buildingId, managerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owner-building-managers", variables.buildingId] });
    }
  });

  const isLoading =
    buildingsQuery.isLoading || managerQueries.some((query) => query.isLoading);
  const failedQuery = [buildingsQuery, ...managerQueries].find((query) => query.isError);

  if (isLoading) {
    return <LoadingState label="Dang tai manager assignments..." />;
  }

  if (failedQuery) {
    return <ErrorState message={extractErrorMessage(failedQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Managers"
        title="Quan ly manager theo building"
        description="Tim manager theo ten hoac email, gan vao tung khu tro."
      />

      <div className="space-y-4">
        {(buildingsQuery.data || []).map((building) => {
          const managers = managersByBuildingId[building.id] || [];
          const expanded = openId === building.id;
          const term = (searchByBuilding[building.id] || "").trim().toLowerCase();
          const picked = pickedByBuilding[building.id];
          const pool = availableManagersQuery.data || [];
          const options =
            term.length >= 2
              ? pool.filter(
                  (m) =>
                    (m.fullName || "").toLowerCase().includes(term) ||
                    (m.email || "").toLowerCase().includes(term)
                )
              : [];

          return (
            <div key={building.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Building</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">{building.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{building.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : building.id)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-orange-200 hover:text-brand-orange"
                >
                  {expanded ? "Thu gon" : "Xem managers"}
                </button>
              </div>

              {expanded ? (
                <div className="mt-6 space-y-4">
                  <div className="relative flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500">Tim manager theo ten hoac email</label>
                    <input
                      type="text"
                      value={searchByBuilding[building.id] || ""}
                      onChange={(event) =>
                        setSearchByBuilding((current) => ({
                          ...current,
                          [building.id]: event.target.value
                        }))
                      }
                      className="tenant-input"
                      placeholder="Go it nhat 2 ky tu..."
                      autoComplete="off"
                    />
                    {picked ? (
                      <p className="text-sm font-semibold text-emerald-800">
                        Da chon: {picked.fullName} ({picked.email}) — ID #{picked.id}
                      </p>
                    ) : null}
                    {term.length >= 2 && options.length > 0 ? (
                      <ul className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {options.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => {
                                setPickedByBuilding((current) => ({ ...current, [building.id]: m }));
                                setSearchByBuilding((current) => ({ ...current, [building.id]: "" }));
                              }}
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-extrabold text-brand-orange">
                                {getInitials(m.fullName)}
                              </span>
                              <span>
                                <span className="block font-extrabold text-slate-900">{m.fullName}</span>
                                <span className="text-xs text-slate-500">{m.email}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {term.length >= 2 && options.length === 0 && !availableManagersQuery.isLoading ? (
                      <p className="text-xs text-slate-500">Khong tim thay manager phu hop.</p>
                    ) : null}
                    {availableManagersQuery.isError ? (
                      <p className="text-sm text-red-600">{extractErrorMessage(availableManagersQuery.error)}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        assignMutation.mutate({
                          buildingId: building.id,
                          managerId: picked?.id
                        })
                      }
                      disabled={!picked?.id || assignMutation.isPending}
                      className="rounded-2xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Assign
                    </button>
                  </div>

                  {managers.length === 0 ? (
                    <p className="text-sm font-semibold text-slate-500">Chua co manager nao o building nay.</p>
                  ) : (
                    managers.map((manager) => (
                      <div
                        key={manager.userId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div>
                          <p className="font-extrabold text-slate-900">{manager.fullName}</p>
                          <p className="text-sm font-semibold text-slate-500">{manager.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            unassignMutation.mutate({ buildingId: building.id, managerId: manager.userId })
                          }
                          disabled={unassignMutation.isPending}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-50"
                        >
                          Unassign
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {assignMutation.isError ? <ErrorState message={extractErrorMessage(assignMutation.error)} /> : null}
      {unassignMutation.isError ? <ErrorState message={extractErrorMessage(unassignMutation.error)} /> : null}
    </section>
  );
}
