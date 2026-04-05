import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";

export default function RentalRequestModal({ open, onClose, presetRoomId, onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomId: "",
    startDate: "",
    endDate: "",
    note: ""
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFormError("");
    setForm({
      roomId: presetRoomId != null ? String(presetRoomId) : "",
      startDate: "",
      endDate: "",
      note: ""
    });
  }, [open, presetRoomId]);

  const mutation = useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/api/v1/tenant/rental-requests", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rental-requests"] });
      toast.success("Da gui yeu cau thue");
      setForm({ roomId: "", startDate: "", endDate: "", note: "" });
      onClose();
      onSuccess?.();
    },
    onError: (error) => setFormError(extractErrorMessage(error))
  });

  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({
      roomId: Number(form.roomId),
      startDate: form.startDate,
      endDate: form.endDate,
      note: form.note
    });
  };

  const roomLocked = presetRoomId != null;

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setFormError("");
      }}
      title="Dang ky thue phong"
      footer={
        <>
          <Button type="button" variant="muted" onClick={onClose}>
            Huy
          </Button>
          <Button type="submit" form="rental-modal-form" variant="secondary" loading={mutation.isPending}>
            Gui
          </Button>
        </>
      }
    >
      <form id="rental-modal-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">Ma phong (roomId)</label>
          <input
            type="number"
            value={form.roomId}
            onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}
            className="tenant-input rounded-btn w-full"
            placeholder="Room ID"
            required
            readOnly={roomLocked}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Ngay bat dau</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              className="tenant-input rounded-btn w-full"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Ngay ket thuc</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
              className="tenant-input rounded-btn w-full"
              required
            />
          </div>
        </div>
        <textarea
          value={form.note}
          onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          className="tenant-input min-h-[120px] rounded-btn w-full"
          placeholder="Ghi chu cho chu nha"
        />
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
      </form>
    </Modal>
  );
}
