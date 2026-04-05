import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { formatDate, formatDateTime, formatMoney } from "../../lib/format";
import { assertCccdForRental } from "../../lib/rentalGate";

export default function RentalRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("ALL");
  const [form, setForm] = useState({
    roomId: "",
    startDate: "",
    endDate: "",
    note: ""
  });
  const [formError, setFormError] = useState("");

  const query = useQuery({
    queryKey: ["tenant-rental-requests"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/rental-requests"))
  });

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => unwrapData(await api.get("/api/v1/profile/me"))
  });

  const mutation = useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/api/v1/tenant/rental-requests", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rental-requests"] });
      setForm({ roomId: "", startDate: "", endDate: "", note: "" });
      setFormError("");
      setModalOpen(false);
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

  const filtered = useMemo(() => {
    const list = query.data || [];
    if (tab === "ALL") return list;
    return list.filter((r) => r.status === tab);
  }, [query.data, tab]);

  const tabDefs = [
    { id: "ALL", label: "Tất cả" },
    { id: "PENDING", label: "PENDING" },
    { id: "APPROVED", label: "APPROVED" },
    { id: "REJECTED", label: "REJECTED" }
  ];

  return (
    <section className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-card">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Yêu cầu thuê</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy md:text-4xl">Danh sách & tạo mới</h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={profileQuery.isLoading}
          onClick={() => {
            if (!assertCccdForRental(profileQuery.data, navigate)) return;
            setModalOpen(true);
          }}
        >
          + Tạo yêu cầu mới
        </Button>
      </div>

      <Tabs tabs={tabDefs} value={tab} onChange={setTab} />

      {query.isLoading ? <LoadingState label="Đang tải rental requests..." /> : null}
      {query.isError ? <ErrorState message={extractErrorMessage(query.error)} /> : null}

      <div className="space-y-4">
        {!query.isLoading &&
          !query.isError &&
          filtered.map((request, i) => (
            <article
              key={request.id}
              className="rounded-card-lg border border-border bg-surface p-6 shadow-card transition-all animate-fade-in"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-navy">
                    {request.buildingName || "Building"} — {request.roomNo || `Room ${request.roomId}`}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-muted">Tạo lúc {formatDateTime(request.createdAt)}</p>
                </div>
                <Badge status={request.status} />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-navy md:grid-cols-2">
                <p>
                  <strong>Bắt đầu:</strong> {formatDate(request.startDate)}
                </p>
                <p>
                  <strong>Kết thúc:</strong> {formatDate(request.endDate)}
                </p>
                <p>
                  <strong>Giá tháng:</strong> {formatMoney(request.monthlyRent)}
                </p>
                <p>
                  <strong>Tenant:</strong> {request.tenantName || "—"}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{request.note || "Không có ghi chú."}</p>
            </article>
          ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title="Gửi yêu cầu thuê phòng"
        footer={
          <>
            <Button type="button" variant="muted" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="rental-req-form" variant="secondary" loading={mutation.isPending}>
              Gửi
            </Button>
          </>
        }
      >
        <form id="rental-req-form" className="space-y-4" onSubmit={submit}>
          <input
            type="number"
            value={form.roomId}
            onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}
            className="tenant-input rounded-btn"
            placeholder="Room ID"
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              className="tenant-input rounded-btn"
              required
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
              className="tenant-input rounded-btn"
              required
            />
          </div>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            className="tenant-input min-h-[120px] rounded-btn"
            placeholder="Ghi chú cho chủ nhà"
          />
          {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        </form>
      </Modal>
    </section>
  );
}
