import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  createMeterReading,
  getManagerBuildings,
  getManagerRooms,
  getMeterReadings
} from "../../lib/managerApi";
import { formatDateTime, formatMoney } from "../../lib/format";
import { OwnerHero } from "../owner/ownerUi.jsx";

function currentPeriod() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export default function ManagerMetersPage() {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [form, setForm] = useState({
    roomId: "",
    utilityType: "ELECTRICITY",
    previousReading: "",
    currentReading: "",
    unitPrice: "",
    note: ""
  });
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

  const roomsQuery = useQuery({
    queryKey: ["manager-rooms", selectedBuilding],
    queryFn: () => getManagerRooms(selectedBuilding),
    enabled: Boolean(selectedBuilding)
  });

  const readingsQuery = useQuery({
    queryKey: ["manager-meter-readings", selectedBuilding, period],
    queryFn: () => getMeterReadings(selectedBuilding, period),
    enabled: Boolean(selectedBuilding && period)
  });

  const createMutation = useMutation({
    mutationFn: createMeterReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-meter-readings", selectedBuilding, period] });
      setForm((current) => ({
        ...current,
        previousReading: "",
        currentReading: "",
        unitPrice: "",
        note: ""
      }));
    }
  });

  if (buildingsQuery.isLoading || roomsQuery.isLoading || readingsQuery.isLoading) {
    return <LoadingState label="Dang tai so dien nuoc..." />;
  }

  const failed = [buildingsQuery, roomsQuery, readingsQuery].find((query) => query.isError);
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const submit = (event) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      roomId: Number(form.roomId),
      period,
      previousReading: Number(form.previousReading),
      currentReading: Number(form.currentReading),
      unitPrice: Number(form.unitPrice)
    });
  };

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Meters"
        title="Nhap va doi soat chi so dien nuoc"
        description="Manager nhap cong to theo building va ky thang, sau do he thong dong bo bill item tu backend."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-700">Building</label>
              <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="tenant-input">
                {(buildingsQuery.data || []).map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-700">Ky thang</label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="tenant-input" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  <th className="pb-3">Phong</th>
                  <th className="pb-3">Loai</th>
                  <th className="pb-3">Chi so</th>
                  <th className="pb-3">Gia don vi</th>
                  <th className="pb-3">Ghi nhan luc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {(readingsQuery.data || []).map((reading) => (
                  <tr key={reading.id}>
                    <td className="py-4">{reading.roomNumber}</td>
                    <td className="py-4">{reading.utilityType}</td>
                    <td className="py-4">{reading.previousReading} - {reading.currentReading}</td>
                    <td className="py-4">{formatMoney(reading.unitPrice)}</td>
                    <td className="py-4">{formatDateTime(reading.recordedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">New reading</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Nhap chi so moi</h2>
          <div className="mt-6 space-y-4">
            <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="tenant-input" required>
              <option value="">Chon phong</option>
              {(roomsQuery.data || []).map((room) => (
                <option key={room.id} value={room.id}>{room.roomNumber}</option>
              ))}
            </select>
            <select value={form.utilityType} onChange={(e) => setForm({ ...form, utilityType: e.target.value })} className="tenant-input">
              <option value="ELECTRICITY">ELECTRICITY</option>
              <option value="WATER">WATER</option>
            </select>
            <input value={form.previousReading} onChange={(e) => setForm({ ...form, previousReading: e.target.value })} className="tenant-input" placeholder="Chi so cu" required />
            <input value={form.currentReading} onChange={(e) => setForm({ ...form, currentReading: e.target.value })} className="tenant-input" placeholder="Chi so moi" required />
            <input value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="tenant-input" placeholder="Don gia" required />
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="tenant-input min-h-[120px]" placeholder="Ghi chu" />
            <button type="submit" disabled={createMutation.isPending} className="w-full rounded-2xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white disabled:opacity-70">
              Luu chi so
            </button>
          </div>
          {createMutation.isError ? <div className="mt-4"><ErrorState message={extractErrorMessage(createMutation.error)} /></div> : null}
        </form>
      </div>
    </section>
  );
}
