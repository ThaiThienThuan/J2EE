import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function MoMoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resultCode = searchParams.get("resultCode");
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  useEffect(() => {
    if (!resultCode) {
      navigate("/tenant/bills", { replace: true });
    }
  }, [navigate, resultCode]);

  useEffect(() => {
    if (!resultCode || resultCode === "0") return undefined;
    const t = setTimeout(() => navigate("/tenant/bills", { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate, resultCode]);

  if (!resultCode) {
    return null;
  }

  const success = resultCode === "0";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-lg items-center justify-center px-4 py-12">
      <div className="w-full rounded-card-lg border border-border bg-surface p-10 text-center shadow-card animate-fade-in">
        {success ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-scale-in">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 animate-scale-in">
            <X className="h-10 w-10" strokeWidth={3} />
          </div>
        )}
        <p className={`mt-6 text-xs font-extrabold uppercase tracking-[0.2em] ${success ? "text-success" : "text-danger"}`}>
          MoMo
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">
          {success ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{message || "Hệ thống đã nhận kết quả từ MoMo."}</p>
        <div className="mt-6 rounded-xl bg-page px-4 py-3 text-left text-sm text-navy">
          <p>
            <strong>orderId:</strong> {orderId || "—"}
          </p>
          <p className="mt-2">
            <strong>resultCode:</strong> {resultCode}
          </p>
        </div>
        {!success ? <p className="mt-4 text-xs text-muted">Tự chuyển về hóa đơn sau 3 giây…</p> : null}
        <Link
          to="/tenant/bills"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-btn bg-secondary px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-secondary-dark"
        >
          Về trang hóa đơn
        </Link>
      </div>
    </div>
  );
}
