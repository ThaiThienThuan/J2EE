import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getOwnerBuildings, getOwnerRooms } from "../../lib/ownerApi";
import { formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, roomStatusClasses, statusBadgeClass } from "./ownerUi.jsx";

export default function OwnerRoomsPage() {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const buildingsQuery = useQuery({
    queryKey: ["owner-buildings"],
    queryFn: getOwnerBuildings
  });

  const roomsQuery = useQuery({
    queryKey: ["owner-rooms", selectedBuilding, selectedStatus],
    queryFn: () =>
      getOwnerRooms({
        buildingId: selectedBuilding || undefined,
        status: selectedStatus === "ALL" ? undefined : selectedStatus
      })
  });

  const statusOptions = useMemo(() => ["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"], []);

  const failed = [buildingsQuery, roomsQuery].find((query) => query.isError);
  if ([buildingsQuery, roomsQuery].some((query) => query.isLoading)) {
    return <LoadingState label="Dang tai danh sach phong..." />;
  }
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const buildings = buildingsQuery.data || [];
  const rooms = roomsQuery.data || [];

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Rooms"
        title="Danh sach phong theo building"
        description="Loc client-side theo building va status, du lieu lay tu owner rooms API."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={selectedBuilding}
            onChange={(event) => setSelectedBuilding(event.target.value)}
            className="tenant-input"
          >
            <option value="">Tat ca building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="tenant-input"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200">
          <div className="hidden grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
            <span>Phong</span>
            <span>Building</span>
            <span>Gia</span>
            <span>Dien tich</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-200">
            {rooms.map((room) => (
              <div key={room.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center">
                <div>
                  <p className="font-extrabold text-slate-900">{room.roomNumber}</p>
                  <p className="text-xs font-semibold text-slate-500 md:hidden">{room.buildingName}</p>
                </div>
                <p className="hidden text-sm font-semibold text-slate-600 md:block">{room.buildingName}</p>
                <p className="text-sm font-semibold text-slate-600">{formatMoney(room.price)}</p>
                <p className="text-sm font-semibold text-slate-600">{room.area || "--"} m²</p>
                <div>
                  <StatusBadge status={room.status} className={statusBadgeClass(roomStatusClasses, room.status)} />
                </div>
              </div>
            ))}
            {rooms.length === 0 ? (
              <div className="px-4 py-6 text-sm font-semibold text-slate-500">Khong co phong nao phu hop bo loc hien tai.</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
