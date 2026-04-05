import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getManagerBuildings, getManagerRooms } from "../../lib/managerApi";
import { formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, roomStatusClasses, statusBadgeClass } from "../owner/ownerUi.jsx";

export default function ManagerRoomsPage() {
  const [searchParams] = useSearchParams();
  const [selectedBuilding, setSelectedBuilding] = useState(searchParams.get("buildingId") || "");

  const buildingsQuery = useQuery({
    queryKey: ["manager-buildings"],
    queryFn: getManagerBuildings
  });

  useEffect(() => {
    if (!selectedBuilding && (buildingsQuery.data || []).length > 0) {
      setSelectedBuilding(String(buildingsQuery.data[0].id));
    }
  }, [buildingsQuery.data, selectedBuilding]);

  const roomsQuery = useQuery({
    queryKey: ["manager-rooms", selectedBuilding],
    queryFn: () => getManagerRooms(selectedBuilding),
    enabled: Boolean(selectedBuilding)
  });

  if (buildingsQuery.isLoading || roomsQuery.isLoading) {
    return <LoadingState label="Dang tai danh sach phong..." />;
  }

  if (buildingsQuery.isError) {
    return <ErrorState message={extractErrorMessage(buildingsQuery.error)} />;
  }

  if (roomsQuery.isError) {
    return <ErrorState message={extractErrorMessage(roomsQuery.error)} />;
  }

  const rooms = roomsQuery.data || [];

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Rooms"
        title="Theo doi phong theo building"
        description="Manager chi thao tac tren cac phong thuoc building duoc assign."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-extrabold text-slate-700">Chon building</label>
          <select
            value={selectedBuilding}
            onChange={(event) => setSelectedBuilding(event.target.value)}
            className="tenant-input"
          >
            {(buildingsQuery.data || []).map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>

        {rooms.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Chua co phong" description="Building nay hien chua co phong de manager theo doi." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  <th className="pb-3">Phong</th>
                  <th className="pb-3">Gia</th>
                  <th className="pb-3">Dien tich</th>
                  <th className="pb-3">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="py-4">{room.roomNumber}</td>
                    <td className="py-4">{formatMoney(room.price)}</td>
                    <td className="py-4">{room.area} m2</td>
                    <td className="py-4">
                      <StatusBadge
                        status={room.status}
                        className={statusBadgeClass(roomStatusClasses, room.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
