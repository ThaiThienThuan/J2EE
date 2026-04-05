import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import { getOwnerBills } from "../../lib/ownerApi";
import { formatDate, formatMoney } from "../../lib/format";
import { OwnerHero, StatusBadge, billStatusClasses, statusBadgeClass } from "./ownerUi.jsx";

const tabs = ["ALL", "UNPAID", "PAID", "OVERDUE"];

export default function OwnerBillsPage() {
  const [status, setStatus] = useState("ALL");
  const billsQuery = useQuery({
    queryKey: ["owner-bills", status],
    queryFn: () => getOwnerBills(status === "ALL" ? undefined : status)
  });

  if (billsQuery.isLoading) {
    return <LoadingState label="Dang tai bills..." />;
  }

  if (billsQuery.isError) {
    return <ErrorState message={extractErrorMessage(billsQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Bills"
        title="Danh sach hoa don"
        description="Owner bills page dùng hoàn toàn owner bill API và chỉ hiển thị thông tin theo scope hiện có."
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
          {(billsQuery.data || []).map((bill) => (
            <article key={bill.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {bill.tenantName} - {bill.roomNumber}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ky {bill.period}</p>
                </div>
                <StatusBadge
                  status={bill.status}
                  className={statusBadgeClass(billStatusClasses, bill.status)}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                <p><strong>Tong tien:</strong> {formatMoney(bill.totalAmount)}</p>
                <p><strong>Han thanh toan:</strong> {formatDate(bill.dueDate)}</p>
                <p><strong>Period:</strong> {bill.period}</p>
              </div>
            </article>
          ))}

          {(billsQuery.data || []).length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Khong co bill nao cho bo loc nay.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
