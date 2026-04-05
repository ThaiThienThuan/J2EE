import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { confirmCashPayment, getManagerBills, getManagerBuildings } from "../../lib/managerApi";
import { formatDate, formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, billStatusClasses, statusBadgeClass } from "../owner/ownerUi.jsx";

const tabs = ["ALL", "UNPAID", "PAID", "OVERDUE"];

export default function ManagerBillsPage() {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [status, setStatus] = useState("ALL");
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

  const billsQuery = useQuery({
    queryKey: ["manager-bills", selectedBuilding, status],
    queryFn: () => getManagerBills(selectedBuilding, status === "ALL" ? undefined : status),
    enabled: Boolean(selectedBuilding)
  });

  const confirmMutation = useMutation({
    mutationFn: confirmCashPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-bills", selectedBuilding] });
    }
  });

  if (buildingsQuery.isLoading || billsQuery.isLoading) {
    return <LoadingState label="Dang tai hoa don..." />;
  }

  const failed = [buildingsQuery, billsQuery].find((query) => query.isError);
  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Bills"
        title="Theo doi hoa don theo building"
        description="Manager co the loc hoa don va xac nhan thu tien mat cho cac bill dang cho xu ly."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="tenant-input">
            {(buildingsQuery.data || []).map((building) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatus(tab)}
                className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                  status === tab ? "bg-brand-orange text-white" : "border border-slate-200 text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(billsQuery.data || []).map((bill) => (
            <article key={bill.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{bill.tenantName} - {bill.roomNumber}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ky {bill.period}</p>
                </div>
                <StatusBadge status={bill.status} className={statusBadgeClass(billStatusClasses, bill.status)} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                <p><strong>So tien:</strong> {formatMoney(bill.totalAmount)}</p>
                <p><strong>Han thanh toan:</strong> {formatDate(bill.dueDate)}</p>
                <p><strong>Bill ID:</strong> #{bill.id}</p>
              </div>
              {bill.status === "UNPAID" ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => confirmMutation.mutate(bill.id)}
                    className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white"
                  >
                    Xac nhan tien mat
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        {confirmMutation.isError ? <div className="mt-4"><ErrorState message={extractErrorMessage(confirmMutation.error)} /></div> : null}
      </div>
    </section>
  );
}
