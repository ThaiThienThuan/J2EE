import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import { getInitials } from "../../lib/format";
import {
  assignManager,
  createOwnerRoom,
  getAvailableManagers,
  getBuildingManagers,
  getOwnerBuildingDetail,
  getOwnerRooms,
  unassignManager
} from "../../lib/ownerApi";
import { formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, roomStatusClasses, statusBadgeClass } from "./ownerUi.jsx";

export default function OwnerBuildingDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [managerSearch, setManagerSearch] = useState("");
  const [pickedManager, setPickedManager] = useState(null);
  const [message, setMessage] = useState("");

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNo: "",
    price: "",
    area: "",
    beds: "1",
    amenities: "",
    description: ""
  });
  const [roomFiles, setRoomFiles] = useState([]);

  const detailQuery = useQuery({
    queryKey: ["owner-building-detail", id],
    queryFn: () => getOwnerBuildingDetail(id)
  });

  const managersQuery = useQuery({
    queryKey: ["owner-building-managers", id],
    queryFn: () => getBuildingManagers(id)
  });

  const roomsQuery = useQuery({
    queryKey: ["owner-building-rooms", id],
    queryFn: () => getOwnerRooms({ buildingId: id })
  });

  const availableManagersQuery = useQuery({
    queryKey: ["owner-available-managers"],
    queryFn: getAvailableManagers
  });

  const previews = useMemo(() => roomFiles.map((f) => URL.createObjectURL(f)), [roomFiles]);
  useEffect(
    () => () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    },
    [previews]
  );

  const assignMutation = useMutation({
    mutationFn: () => assignManager(id, Number(pickedManager.id)),
    onSuccess: () => {
      setMessage("Assign manager thanh cong.");
      setPickedManager(null);
      setManagerSearch("");
      queryClient.invalidateQueries({ queryKey: ["owner-building-managers", id] });
      queryClient.invalidateQueries({ queryKey: ["owner-buildings"] });
    }
  });

  const unassignMutation = useMutation({
    mutationFn: (targetManagerId) => unassignManager(id, targetManagerId),
    onSuccess: () => {
      setMessage("Unassign manager thanh cong.");
      queryClient.invalidateQueries({ queryKey: ["owner-building-managers", id] });
      queryClient.invalidateQueries({ queryKey: ["owner-buildings"] });
    }
  });

  const createRoomMutation = useMutation({
    mutationFn: async (body) => createOwnerRoom(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-building-rooms", id] });
      queryClient.invalidateQueries({ queryKey: ["owner-buildings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-rooms"] });
      toast.success("Tao phong thanh cong!");
      setRoomModalOpen(false);
      setRoomForm({ roomNo: "", price: "", area: "", beds: "1", amenities: "", description: "" });
      setRoomFiles([]);
    }
  });

  const failed = [detailQuery, managersQuery, roomsQuery].find((query) => query.isError);
  if ([detailQuery, managersQuery, roomsQuery].some((query) => query.isLoading)) {
    return <LoadingState label="Dang tai building detail..." />;
  }
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const building = detailQuery.data;
  const managers = managersQuery.data || [];
  const rooms = roomsQuery.data || [];

  const term = managerSearch.trim().toLowerCase();
  const managerPool = availableManagersQuery.data || [];
  const managerOptions =
    term.length >= 2
      ? managerPool.filter(
          (m) =>
            (m.fullName || "").toLowerCase().includes(term) ||
            (m.email || "").toLowerCase().includes(term)
        )
      : [];

  const submitRoom = async (event) => {
    event.preventDefault();
    const urls = [];
    const slice = roomFiles.slice(0, 5);
    try {
      for (const file of slice) {
        urls.push(await uploadImageToCloudinary(file));
      }
    } catch (e) {
      toast.error(extractErrorMessage(e));
      return;
    }
    createRoomMutation.mutate({
      roomNo: roomForm.roomNo.trim(),
      price: Number(roomForm.price),
      area: roomForm.area ? Number(roomForm.area) : undefined,
      beds: roomForm.beds ? Number(roomForm.beds) : 1,
      amenities: roomForm.amenities.trim() || undefined,
      description: roomForm.description.trim() || undefined,
      imageUrls: urls.length ? urls : undefined
    });
  };

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Building detail"
        title={building.name}
        description={building.description || "Thong tin chi tiet building."}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Thong tin</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <strong>ID:</strong> {building.id}
              </p>
              <p>
                <strong>Dia chi:</strong> {building.address}
              </p>
              <p>
                <strong>Publish:</strong> {building.publishStatus || "PRIVATE"}
              </p>
              <p>
                <strong>Owner ID:</strong> {building.owner?.id || building.ownerId || "--"}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Managers</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Gan manager vao building</h2>
              </div>
            </div>

            <div className="relative mt-5 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500">Tim manager theo ten hoac email</label>
              <input
                type="text"
                value={managerSearch}
                onChange={(event) => setManagerSearch(event.target.value)}
                className="tenant-input"
                placeholder="Go it nhat 2 ky tu..."
                autoComplete="off"
              />
              {pickedManager ? (
                <p className="text-sm font-semibold text-emerald-800">
                  Da chon: {pickedManager.fullName} ({pickedManager.email})
                </p>
              ) : null}
              {term.length >= 2 && managerOptions.length > 0 ? (
                <ul className="absolute top-[72px] z-10 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {managerOptions.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => {
                          setPickedManager(m);
                          setManagerSearch("");
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
              {availableManagersQuery.isError ? (
                <p className="text-sm text-red-600">{extractErrorMessage(availableManagersQuery.error)}</p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  assignMutation.mutate();
                }}
                disabled={assignMutation.isPending || !pickedManager}
                className="rounded-2xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {assignMutation.isPending ? "Dang assign..." : "Assign"}
              </button>
            </div>
            {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {assignMutation.isError ? (
              <p className="mt-3 text-sm font-semibold text-red-700">{extractErrorMessage(assignMutation.error)}</p>
            ) : null}

            <div className="mt-6 space-y-3">
              {managers.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">Building nay chua co manager nao.</p>
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
                      onClick={() => {
                        setMessage("");
                        unassignMutation.mutate(manager.userId);
                      }}
                      disabled={unassignMutation.isPending}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-50"
                    >
                      Unassign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Phong trong building</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Danh sach phong</h2>
            </div>
            <button
              type="button"
              onClick={() => setRoomModalOpen(true)}
              className="rounded-2xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white"
            >
              + Them phong
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {rooms.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">Building nay chua co phong nao.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-slate-900">{room.roomNumber}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{room.buildingName}</p>
                    </div>
                    <StatusBadge status={room.status} className={statusBadgeClass(roomStatusClasses, room.status)} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <strong>Gia:</strong> {formatMoney(room.price)}
                    </p>
                    <p>
                      <strong>Dien tich:</strong> {room.area || "--"} m²
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        open={roomModalOpen}
        onClose={() => !createRoomMutation.isPending && setRoomModalOpen(false)}
        title="Them phong"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
              disabled={createRoomMutation.isPending}
              onClick={() => setRoomModalOpen(false)}
            >
              Huy
            </button>
            <button
              type="submit"
              form="create-room-form"
              className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
              disabled={createRoomMutation.isPending}
            >
              {createRoomMutation.isPending ? "Dang tao..." : "Tao phong"}
            </button>
          </div>
        }
      >
        <form id="create-room-form" className="space-y-3" onSubmit={submitRoom}>
          <input
            className="tenant-input w-full"
            placeholder="So phong *"
            value={roomForm.roomNo}
            onChange={(e) => setRoomForm((c) => ({ ...c, roomNo: e.target.value }))}
            required
          />
          <input
            className="tenant-input w-full"
            type="number"
            placeholder="Gia (VND) *"
            value={roomForm.price}
            onChange={(e) => setRoomForm((c) => ({ ...c, price: e.target.value }))}
            required
          />
          <input
            className="tenant-input w-full"
            type="number"
            step="0.1"
            placeholder="Dien tich m2 *"
            value={roomForm.area}
            onChange={(e) => setRoomForm((c) => ({ ...c, area: e.target.value }))}
            required
          />
          <input
            className="tenant-input w-full"
            type="number"
            min={1}
            placeholder="So giuong"
            value={roomForm.beds}
            onChange={(e) => setRoomForm((c) => ({ ...c, beds: e.target.value }))}
          />
          <input
            className="tenant-input w-full"
            placeholder="Tien nghi"
            value={roomForm.amenities}
            onChange={(e) => setRoomForm((c) => ({ ...c, amenities: e.target.value }))}
          />
          <textarea
            className="tenant-input min-h-[80px] w-full"
            placeholder="Mo ta"
            value={roomForm.description}
            onChange={(e) => setRoomForm((c) => ({ ...c, description: e.target.value }))}
          />
          <div>
            <label className="text-xs font-bold text-slate-500">Anh phong (toi da 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 5);
                setRoomFiles(files);
              }}
            />
            {previews.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <img key={src} src={src} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            ) : null}
          </div>
          {createRoomMutation.isError ? (
            <p className="text-sm text-red-600">{extractErrorMessage(createRoomMutation.error)}</p>
          ) : null}
        </form>
      </Modal>
    </section>
  );
}
