import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { formatDateTime } from "../../lib/format";

export default function MaintenancePage() {
  const [form, setForm] = useState({
    roomId: "",
    title: "",
    description: "",
    priority: "MEDIUM"
  });
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const contractsQuery = useQuery({
    queryKey: ["tenant-contracts"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/contracts"))
  });

  const activeContracts = useMemo(
    () => (contractsQuery.data || []).filter((c) => c.status === "ACTIVE"),
    [contractsQuery.data]
  );

  useEffect(() => {
    if (activeContracts.length === 1) {
      setForm((current) => ({ ...current, roomId: String(activeContracts[0].roomId) }));
    }
  }, [activeContracts]);

  const listQuery = useQuery({
    queryKey: ["tenant-maintenance"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/maintenance"))
  });

  const mutation = useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/api/v1/tenant/maintenance", payload)),
    onSuccess: () => {
      setMessage("Da gui maintenance request thanh cong.");
      setForm((current) => ({
        ...current,
        roomId: activeContracts.length === 1 ? String(activeContracts[0].roomId) : "",
        title: "",
        description: ""
      }));
      setFileName("");
      listQuery.refetch();
    }
  });

  const submit = (event) => {
    event.preventDefault();
    setMessage("");
    const roomId =
      activeContracts.length === 1
        ? activeContracts[0].roomId
        : form.roomId
          ? Number(form.roomId)
          : null;
    mutation.mutate({
      roomId,
      title: form.title,
      description: form.description,
      priority: form.priority,
      imageUrl: fileName ? `local-file:${fileName}` : null
    });
  };

  const noContract = !contractsQuery.isLoading && activeContracts.length === 0;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Maintenance</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Gui yeu cau bao tri</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Chon phong tu hop dong ACTIVE dang hieu luc.</p>

        {contractsQuery.isLoading ? <p className="mt-4 text-sm text-slate-500">Dang tai hop dong...</p> : null}

        {noContract ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-900">
            Ban chua co hop dong thue dang hieu luc. Khong the gui yeu cau bao tri.
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {activeContracts.length > 1 ? (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Chon phong</label>
              <select
                value={form.roomId}
                onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}
                className="tenant-input"
                required
              >
                <option value="">-- Chon --</option>
                {activeContracts.map((c) => (
                  <option key={c.id} value={c.roomId}>
                    Phong {c.roomNo} - {c.buildingName}
                  </option>
                ))}
              </select>
            </div>
          ) : activeContracts.length === 1 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              Phong: Phong {activeContracts[0].roomNo} - {activeContracts[0].buildingName}
            </p>
          ) : null}

          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            className="tenant-input"
            placeholder="Tieu de"
            required
            disabled={noContract}
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="tenant-input min-h-[140px]"
            placeholder="Mo ta van de"
            required
            disabled={noContract}
          />
          <select
            value={form.priority}
            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
            className="tenant-input"
            disabled={noContract}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
            Anh dinh kem (chua upload that)
            <input
              type="file"
              className="mt-3 block w-full text-sm"
              disabled={noContract}
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
            {fileName ? <span className="mt-2 block text-xs text-slate-500">Da chon: {fileName}</span> : null}
          </label>
          {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
          {mutation.isError ? <p className="text-sm font-semibold text-red-700">{extractErrorMessage(mutation.error)}</p> : null}
          <button type="submit" disabled={mutation.isPending || noContract} className="tenant-submit">
            {mutation.isPending ? "Dang gui..." : "Gui yeu cau bao tri"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Danh sach</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Yeu cau cua toi</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Du lieu tu `GET /api/v1/tenant/maintenance`.</p>
        </div>

        {listQuery.isLoading ? <LoadingState label="Dang tai danh sach..." /> : null}
        {listQuery.isError ? <ErrorState message={extractErrorMessage(listQuery.error)} /> : null}

        {!listQuery.isLoading && !listQuery.isError && (listQuery.data || []).length === 0 ? (
          <p className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft">Chua co yeu cau bao tri.</p>
        ) : null}

        {!listQuery.isLoading &&
          !listQuery.isError &&
          (listQuery.data || []).map((row) => (
            <article key={row.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-slate-900">{row.title || "Bao tri"}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                  {row.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{row.description}</p>
              <div className="mt-4 grid gap-2 text-xs text-slate-500">
                {row.roomName ? (
                  <p>
                    <strong className="text-slate-700">Phong:</strong> {row.roomName}
                  </p>
                ) : null}
                <p>
                  <strong className="text-slate-700">Tao luc:</strong> {formatDateTime(row.createdAt)}
                </p>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
