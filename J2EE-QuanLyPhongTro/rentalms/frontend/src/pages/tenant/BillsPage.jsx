import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { formatDate, formatMoney } from "../../lib/format";

export default function BillsPage() {
  const [openItems, setOpenItems] = useState({});
  const query = useQuery({
    queryKey: ["tenant-bills"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/bills"))
  });

  const paymentMutation = useMutation({
    mutationFn: async (bill) =>
      unwrapData(
        await api.post(`/api/v1/payments/momo/bills/${bill.id}/create`, {
          amount: bill.outstandingAmount || bill.totalAmount || 0,
          payerName: bill.tenantName || "Tenant",
          note: `Thanh toan bill ${bill.id}`
        })
      ),
    onSuccess: (payload) => {
      const redirectUrl = payload?.payUrl || payload?.deeplink || payload?.endpoint;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        toast.success("Đã tạo lệnh MoMo. Kiểm tra phản hồi từ backend.");
      }
    }
  });

  const toggleBillItems = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="animate-fade-in space-y-4">
      <div className="rounded-card-lg border border-border bg-gradient-to-r from-navy via-[#2D1B69] to-navy p-6 text-white shadow-soft md:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">Billing</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Hóa đơn của tôi</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">Theo dõi kỳ thanh toán, công nợ và thanh toán MoMo khi còn nợ.</p>
      </div>

      {query.isLoading ? <LoadingState label="Đang tải hóa đơn..." /> : null}
      {query.isError ? <ErrorState message={extractErrorMessage(query.error)} /> : null}

      {!query.isLoading &&
        !query.isError &&
        (query.data || []).map((bill, i) => {
          const outstanding = Number(bill.outstandingAmount || 0);
          const expanded = !!openItems[bill.id];
          const items = Array.isArray(bill.items) ? bill.items : [];
          return (
            <article
              key={bill.id}
              className="overflow-hidden rounded-card-lg border border-border bg-surface shadow-card transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-navy md:text-2xl">
                      Kỳ {bill.period} — {bill.buildingName}
                    </h2>
                    {bill.status === "PAID" ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-success animate-scale-in" aria-hidden />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-muted">Phòng {bill.roomNo}</p>
                </div>
                <Badge status={bill.status} />
              </div>

              <div className="grid gap-3 border-t border-border bg-page/50 px-5 py-4 text-sm text-navy md:grid-cols-2 md:px-6">
                <p>
                  <span className="font-bold text-muted">Tổng tiền:</span> {formatMoney(bill.totalAmount)}
                </p>
                <p>
                  <span className="font-bold text-muted">Đã trả:</span> {formatMoney(bill.paidAmount)}
                </p>
                <p className={outstanding > 0 ? "font-extrabold text-danger md:col-span-2" : ""}>
                  <span className="font-bold text-muted">Còn nợ:</span> {formatMoney(bill.outstandingAmount)}
                </p>
                <p>
                  <span className="font-bold text-muted">Hạn TT:</span> {formatDate(bill.dueDate)}
                </p>
              </div>

              {items.length > 0 ? (
                <div className="border-t border-border px-5 py-3 md:px-6">
                  <button
                    type="button"
                    onClick={() => toggleBillItems(bill.id)}
                    className="flex w-full min-h-11 items-center justify-between rounded-lg bg-page px-4 py-2 text-left text-sm font-bold text-navy transition hover:bg-slate-200/60"
                  >
                    Chi tiết khoản mục ({items.length})
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expanded ? (
                    <ul className="mt-3 space-y-2">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-bold text-navy">{item.description || item.itemType}</p>
                            <p className="text-xs text-muted">{item.itemType}</p>
                          </div>
                          <span className="font-extrabold text-secondary">{formatMoney(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 border-t border-border p-5 md:p-6">
                {outstanding > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    loading={paymentMutation.isPending}
                    onClick={() => paymentMutation.mutate(bill)}
                  >
                    Thanh toán MoMo
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}

      {paymentMutation.isError ? <ErrorState message={extractErrorMessage(paymentMutation.error)} /> : null}
    </section>
  );
}
