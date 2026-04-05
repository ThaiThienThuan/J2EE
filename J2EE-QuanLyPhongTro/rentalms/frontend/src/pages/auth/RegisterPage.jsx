import { House, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { api, extractErrorMessage } from "../../lib/api";

function strengthScore(password) {
  let s = 0;
  if (password.length >= 6) s += 1;
  if (password.length >= 10) s += 1;
  if (/[0-9]/.test(password)) s += 1;
  if (/[^A-Za-z0-9]/.test(password)) s += 1;
  if (/[A-Z]/.test(password)) s += 1;
  return Math.min(s, 4);
}

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const score = useMemo(() => strengthScore(form.password), [form.password]);
  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][score];

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/v1/auth/register", form);
      setSuccess("Đăng ký thành công. Chuyển đến đăng nhập…");
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-auth-bg px-4 py-10">
      <div className="grid w-full max-w-[1000px] min-h-[640px] overflow-hidden rounded-[24px] bg-surface shadow-[0_20px_60px_rgba(61,35,20,0.15)] lg:grid-cols-[380px_1fr]">
        <div className="hidden flex-col justify-center bg-gradient-to-br from-[#5C3520] via-[#7D4E2D] to-auth-primary p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <House className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold">TroTot</span>
          </div>
          <h1 className="mt-10 font-display text-3xl font-bold leading-snug">Tham gia cộng đồng TroTot!</h1>
          <p className="mt-4 text-sm leading-relaxed opacity-80">Đăng ký để trải nghiệm quản lý phòng trọ thông minh.</p>
          <div className="mt-8 space-y-3">
            <div className="flex gap-3 rounded-xl bg-white/12 p-4">
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-sm font-bold">Chủ nhà</p>
                <p className="text-xs opacity-75">Đăng phòng, quản lý hợp đồng</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-white/12 p-4">
              <span className="text-xl">👤</span>
              <div>
                <p className="text-sm font-bold">Người thuê</p>
                <p className="text-xs opacity-75">Tìm phòng, xem hóa đơn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2 className="font-display text-[26px] font-bold text-auth-text">Tạo tài khoản mới</h2>
          <p className="mt-2 text-sm text-auth-muted">Điền thông tin để bắt đầu (self-register tạo tenant).</p>

          {error ? (
            <div className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
          ) : null}
          {success ? (
            <div className="mt-6 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {success}
            </div>
          ) : null}

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-auth-text">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-auth-primary" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((c) => ({ ...c, fullName: e.target.value }))}
                  className="w-full rounded-[10px] border-[1.5px] border-auth-border bg-auth-bg py-3 pl-10 pr-3 text-sm font-semibold text-auth-text outline-none transition focus:border-auth-primary focus:bg-white focus:ring-4 focus:ring-auth-primary/15"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-auth-text">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-auth-border bg-auth-bg px-3 py-3 text-sm font-semibold text-auth-text outline-none transition focus:border-auth-primary focus:bg-white focus:ring-4 focus:ring-auth-primary/15"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-auth-text">Mật khẩu</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-auth-border bg-auth-bg px-3 py-3 text-sm font-semibold text-auth-text outline-none transition focus:border-auth-primary focus:bg-white focus:ring-4 focus:ring-auth-primary/15"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
              {form.password ? (
                <div className="mt-2">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-auth-border">
                    <div
                      className="bg-auth-primary transition-all duration-300"
                      style={{ width: `${(score / 4) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-auth-muted">Độ mạnh: {strengthLabel}</p>
                </div>
              ) : null}
            </div>
            <Button type="submit" variant="auth" size="lg" className="mt-2 w-full rounded-[10px]" loading={submitting}>
              Tạo tài khoản
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-auth-muted">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-extrabold text-auth-primary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
