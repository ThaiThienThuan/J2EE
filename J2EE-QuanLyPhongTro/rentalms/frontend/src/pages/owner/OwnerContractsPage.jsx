import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  activateContract,
  downloadOwnerContractDocx,
  getOwnerContracts,
  renewContract,
  terminateContract
} from "../../lib/ownerApi";
import { formatDate, formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, contractStatusClasses, statusBadgeClass } from "./ownerUi.jsx";

const tabs = ["ALL", "ACTIVE", "EXPIRED", "TERMINATED"];

async function saveBlobDownload(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function OwnerContractsPage() {
  const [status, setStatus] = useState("ALL");
  const [renewingId, setRenewingId] = useState(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [detail, setDetail] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const queryClient = useQueryClient();

  const contractsQuery = useQuery({
    queryKey: ["owner-contracts", status],
    queryFn: () => getOwnerContracts(status === "ALL" ? undefined : status)
  });

  const activateMutation = useMutation({
    mutationFn: activateContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    }
  });

  const terminateMutation = useMutation({
    mutationFn: terminateContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    }
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, date }) => renewContract(id, date),
    onSuccess: () => {
      setRenewingId(null);
      setNewEndDate("");
      queryClient.invalidateQueries({ queryKey: ["owner-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    }
  });

  if (contractsQuery.isLoading) {
    return <LoadingState label="Dang tai contracts..." />;
  }

  if (contractsQuery.isError) {
    return <ErrorState message={extractErrorMessage(contractsQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Contracts"
        title="Quan ly hop dong"
        description="Xem chi tiet, tai file DOCX, xac nhan kich hoat va gia han."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                status === tab
                  ? "bg-brand-orange text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-brand-orange"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {(contractsQuery.data || []).map((contract) => (
            <article key={contract.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {contract.tenantName} - {contract.roomNumber}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{contract.buildingName}</p>
                </div>
                <StatusBadge
                  status={contract.status}
                  className={statusBadgeClass(contractStatusClasses, contract.status)}
                />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                <p>
                  <strong>Bat dau:</strong> {formatDate(contract.startDate)}
                </p>
                <p>
                  <strong>Ket thuc:</strong> {formatDate(contract.endDate)}
                </p>
                <p>
                  <strong>Tien thue:</strong> {formatMoney(contract.monthlyRent)}
                </p>
                <p>
                  <strong>Offline:</strong>{" "}
                  {contract.activationConfirmed ? "Da xac nhan" : "Cho xac nhan offline"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" variant="secondary" size="sm" onClick={() => setDetail(contract)}>
                  Xem
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={downloadingId === contract.id}
                  onClick={async () => {
                    setDownloadingId(contract.id);
                    try {
                      const blob = await downloadOwnerContractDocx(contract.id);
                      await saveBlobDownload(blob, `HopDong_${contract.id}.docx`);
                      toast.success("Da tai file");
                    } catch (e) {
                      toast.error(extractErrorMessage(e));
                    } finally {
                      setDownloadingId(null);
                    }
                  }}
                >
                  Tai DOCX
                </Button>
                {!contract.activationConfirmed ? (
                  <button
                    type="button"
                    onClick={() => activateMutation.mutate(contract.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white"
                  >
                    Confirm Active
                  </button>
                ) : null}

                {contract.status === "ACTIVE" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => terminateMutation.mutate(contract.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white"
                    >
                      Terminate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenewingId((current) => (current === contract.id ? null : contract.id))}
                      className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-extrabold text-sky-700"
                    >
                      Renew
                    </button>
                  </>
                ) : null}
              </div>

              {renewingId === contract.id ? (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(event) => setNewEndDate(event.target.value)}
                    className="tenant-input"
                  />
                  <button
                    type="button"
                    onClick={() => renewMutation.mutate({ id: contract.id, date: newEndDate })}
                    disabled={!newEndDate || renewMutation.isPending}
                    className="rounded-xl bg-brand-orange px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Xac nhan renew
                  </button>
                </div>
              ) : null}
            </article>
          ))}

          {(contractsQuery.data || []).length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Khong co contract nao cho bo loc nay.</p>
          ) : null}
        </div>

        {activateMutation.isError ? <ErrorState message={extractErrorMessage(activateMutation.error)} /> : null}
        {terminateMutation.isError ? <ErrorState message={extractErrorMessage(terminateMutation.error)} /> : null}
        {renewMutation.isError ? <ErrorState message={extractErrorMessage(renewMutation.error)} /> : null}
      </div>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Chi tiet hop dong">
        {detail ? (
          <div className="max-h-[70vh] space-y-2 overflow-y-auto text-sm text-slate-700">
            <p>
              <strong>Tenant:</strong> {detail.tenantName}
            </p>
            <p>
              <strong>Email:</strong> {detail.tenantEmail || "—"}
            </p>
            <p>
              <strong>Phone:</strong> {detail.tenantPhone || "—"}
            </p>
            <p>
              <strong>Phong:</strong> {detail.roomNumber} (#{detail.roomId})
            </p>
            <p>
              <strong>Building:</strong> {detail.buildingName}
            </p>
            <p>
              <strong>Dia chi:</strong> {detail.buildingAddress || "—"}
            </p>
            <p>
              <strong>Bat dau / Ket thuc:</strong> {formatDate(detail.startDate)} → {formatDate(detail.endDate)}
            </p>
            <p>
              <strong>Tien thue:</strong> {formatMoney(detail.monthlyRent)}
            </p>
            <p>
              <strong>Coc:</strong> {formatMoney(detail.deposit)}
            </p>
            <p>
              <strong>Chu ky:</strong> {detail.rentCycle || "—"}
            </p>
            <p>
              <strong>Chinh sach:</strong> {detail.policy || "—"}
            </p>
            <p>
              <strong>Trang thai:</strong> {detail.status} — Kich hoat:{" "}
              {detail.activationConfirmed ? "Da xac nhan" : "Chua"}
            </p>
            <div className="pt-4">
              <Button
                type="button"
                variant="primary"
                loading={downloadingId === detail.id}
                onClick={async () => {
                  setDownloadingId(detail.id);
                  try {
                    const blob = await downloadOwnerContractDocx(detail.id);
                    await saveBlobDownload(blob, `HopDong_${detail.id}.docx`);
                    toast.success("Da tai file");
                  } catch (e) {
                    toast.error(extractErrorMessage(e));
                  } finally {
                    setDownloadingId(null);
                  }
                }}
              >
                Tai DOCX
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
