import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { formatDate, formatMoney } from "../../lib/format";

async function downloadTenantContractDocx(contractId) {
  const res = await api.get(`/api/v1/tenant/contracts/${contractId}/download`, { responseType: "blob" });
  const blob = res.data;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `HopDong_${contractId}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ContractsPage() {
  const [detail, setDetail] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const query = useQuery({
    queryKey: ["tenant-contracts"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/contracts"))
  });

  return (
    <section className="animate-fade-in space-y-4">
      <div className="rounded-card-lg border border-border bg-surface p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Contracts</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-navy">Hợp đồng của tôi</h1>
      </div>

      {query.isLoading ? <LoadingState label="Dang tai hop dong..." /> : null}
      {query.isError ? <ErrorState message={extractErrorMessage(query.error)} /> : null}

      {!query.isLoading &&
        !query.isError &&
        (query.data || []).map((contract) => (
          <article key={contract.id} className="rounded-card-lg border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-navy">
                  {contract.buildingName} - {contract.roomNo}
                </h2>
                <p className="mt-2 text-sm font-semibold text-muted">{contract.tenantName || contract.tenantEmail}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge status={contract.status} />
                {contract.activationConfirmed ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 ring-1 ring-emerald-200">
                    Đã kích hoạt
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {["PENDING", "ACTIVE", "EXPIRED"].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full ${contract.status === step ? "bg-secondary" : "bg-page"}`}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-navy md:grid-cols-2 xl:grid-cols-4">
              <p>
                <strong>Bắt đầu:</strong> {formatDate(contract.startDate)}
              </p>
              <p>
                <strong>Kết thúc:</strong> {formatDate(contract.endDate)}
              </p>
              <p>
                <strong>Tiền thuê:</strong> {formatMoney(contract.monthlyRent)}
              </p>
              <p>
                <strong>Đặt cọc:</strong> {formatMoney(contract.deposit)}
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-page px-4 py-3 text-sm font-semibold text-muted">
              Xác nhận kích hoạt: {contract.activationConfirmed ? "Đã xác nhận offline" : "Chưa xác nhận offline"}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setDetail(contract)}>
                Xem chi tiết
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={downloadingId === contract.id}
                onClick={async () => {
                  setDownloadingId(contract.id);
                  try {
                    await downloadTenantContractDocx(contract.id);
                  } finally {
                    setDownloadingId(null);
                  }
                }}
              >
                Tải hợp đồng DOCX
              </Button>
            </div>
          </article>
        ))}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Chi tiết hợp đồng">
        {detail ? (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm text-navy">
            <p>
              <strong>Người thuê:</strong> {detail.tenantName}
            </p>
            <p>
              <strong>Email:</strong> {detail.tenantEmail || "—"}
            </p>
            <p>
              <strong>Điện thoại:</strong> {detail.tenantPhone || "—"}
            </p>
            <p>
              <strong>Phòng:</strong> {detail.roomNo}
            </p>
            <p>
              <strong>Tòa nhà:</strong> {detail.buildingName}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {detail.buildingAddress || "—"}
            </p>
            <p>
              <strong>Bắt đầu:</strong> {formatDate(detail.startDate)}
            </p>
            <p>
              <strong>Kết thúc:</strong> {formatDate(detail.endDate)}
            </p>
            <p>
              <strong>Tiền thuê / tháng:</strong> {formatMoney(detail.monthlyRent)}
            </p>
            <p>
              <strong>Đặt cọc:</strong> {formatMoney(detail.deposit)}
            </p>
            <p>
              <strong>Chu kỳ:</strong> {detail.rentCycle || "—"}
            </p>
            <p>
              <strong>Phạt trễ (%):</strong> {detail.lateFeePercent != null ? detail.lateFeePercent : "—"}
            </p>
            <p>
              <strong>Chính sách:</strong> {detail.policy || "—"}
            </p>
            <p>
              <strong>Trạng thái:</strong> {detail.status}
            </p>
            <p>
              <strong>Kích hoạt offline:</strong> {detail.activationConfirmed ? "Đã xác nhận" : "Chưa"}
            </p>
            <div className="pt-4">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                loading={downloadingId === detail.id}
                onClick={async () => {
                  setDownloadingId(detail.id);
                  try {
                    await downloadTenantContractDocx(detail.id);
                  } finally {
                    setDownloadingId(null);
                  }
                }}
              >
                Tải hợp đồng DOCX
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
