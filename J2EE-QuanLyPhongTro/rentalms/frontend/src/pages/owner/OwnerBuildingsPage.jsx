import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { createBuilding, getOwnerBuildings, getOwnerRooms } from "../../lib/ownerApi";
import { OwnerHero, StatusBadge, statusBadgeClass } from "./ownerUi.jsx";

const publishClasses = {
  PUBLIC: "bg-emerald-100 text-emerald-700",
  PRIVATE: "bg-slate-200 text-slate-700"
};

export default function OwnerBuildingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    publishStatus: "PUBLIC"
  });
  const queryClient = useQueryClient();

  const buildingsQuery = useQuery({
    queryKey: ["owner-buildings"],
    queryFn: getOwnerBuildings
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBuilding({
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim() || undefined,
        publishStatus: form.publishStatus
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-buildings"] });
      toast.success("Tao khu tro thanh cong!");
      setModalOpen(false);
      setForm({ name: "", address: "", description: "", publishStatus: "PUBLIC" });
    }
  });

  const roomCountQueries = useQueries({
    queries: (buildingsQuery.data || []).map((building) => ({
      queryKey: ["owner-building-rooms-count", building.id],
      queryFn: async () => {
        const rooms = await getOwnerRooms({ buildingId: building.id });
        return { buildingId: building.id, count: rooms.length };
      },
      enabled: Boolean(buildingsQuery.data)
    }))
  });

  if (buildingsQuery.isLoading) {
    return <LoadingState label="Dang tai danh sach building..." />;
  }

  if (buildingsQuery.isError) {
    return <ErrorState message={extractErrorMessage(buildingsQuery.error)} />;
  }

  const countMap = Object.fromEntries(
    roomCountQueries.filter((query) => query.data).map((query) => [query.data.buildingId, query.data.count])
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <OwnerHero
          eyebrow="Buildings"
          title="Tat ca building cua owner"
          description="Danh sach building lay tu `/api/v1/owner/buildings`, room count duoc suy ra client-side."
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 rounded-2xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20"
        >
          + Tao khu tro moi
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(buildingsQuery.data || []).map((building) => (
          <article
            key={building.id}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <StatusBadge
                status={building.publishStatus || "PRIVATE"}
                className={statusBadgeClass(publishClasses, building.publishStatus)}
              />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">#{building.id}</span>
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold text-slate-900">{building.name}</h2>
            <p className="mt-3 text-sm font-semibold text-slate-500">{building.address}</p>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
              {building.description || "Chua co mo ta cho building nay."}
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              So phong: {countMap[building.id] ?? "Dang tai..."}
            </div>
            <Link
              to={`/owner/buildings/${building.id}`}
              className="mt-5 inline-flex rounded-2xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
            >
              Xem chi tiet
            </Link>
          </article>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !createMutation.isPending && setModalOpen(false)}
        title="Tao khu tro moi"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
              disabled={createMutation.isPending}
              onClick={() => setModalOpen(false)}
            >
              Huy
            </button>
            <button
              type="button"
              className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
              disabled={createMutation.isPending || !form.name.trim() || !form.address.trim()}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Dang tao..." : "Tao"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <input
            className="tenant-input w-full"
            placeholder="Ten khu tro *"
            value={form.name}
            onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
            required
          />
          <input
            className="tenant-input w-full"
            placeholder="Dia chi *"
            value={form.address}
            onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))}
            required
          />
          <textarea
            className="tenant-input min-h-[100px] w-full"
            placeholder="Mo ta"
            value={form.description}
            onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
          />
          <select
            className="tenant-input w-full"
            value={form.publishStatus}
            onChange={(e) => setForm((c) => ({ ...c, publishStatus: e.target.value }))}
          >
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
          {createMutation.isError ? (
            <p className="text-sm text-red-600">{extractErrorMessage(createMutation.error)}</p>
          ) : null}
        </div>
      </Modal>
    </section>
  );
}
