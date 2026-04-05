import { Bell, Bolt, Eye, EyeOff, House, Lock, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { setToken } from "../../lib/auth";

function roleHome(role) {
  if (role === "OWNER") return "/owner";
  if (role === "MANAGER") return "/manager";
  if (role === "ADMIN") return "/admin";
  return "/tenant";
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return undefined;
    setShake(true);
    const t = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(t);
  }, [error]);

  const fillDemo = (email, pass) => {
    setForm({ email, password: pass });
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post("/api/v1/auth/login", form);
      const payload = unwrapData(response);
      if (!payload?.token) {
        throw new Error("API khong tra ve token hop le.");
      }
      setToken(payload.token);
      navigate(roleHome(payload.role), { replace: true });
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-auth-bg px-4 py-10">
      <div
        className={`grid w-full max-w-[1000px] min-h-[600px] overflow-hidden rounded-[24px] bg-surface shadow-[0_20px_60px_rgba(61,35,20,0.15)] lg:grid-cols-2 ${shake ? "animate-shake" : ""}`}
      >
        <div className="hidden flex-col justify-center bg-gradient-to-br from-[#3D2314] via-[#7D4E2D] to-auth-primary p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <House className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold">TroTot</span>
          </div>
          <h1 className="mt-12 font-display text-4xl font-bold leading-snug">Chào mừng bạn trở lại!</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-80">
            Đăng nhập để quản lý phòng trọ, theo dõi hóa đơn và kết nối với chủ nhà dễ dàng.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-sm font-semibold">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Shield className="h-4 w-4" />
              </span>
              Bảo mật tài khoản với JWT
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bolt className="h-4 w-4" />
              </span>
              Truy cập nhanh mọi tính năng
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bell className="h-4 w-4" />
              </span>
              Thông báo hóa đơn & hợp đồng kịp thời
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2 className="font-display text-[28px] font-bold text-auth-text">Đăng nhập</h2>
          <p className="mt-2 text-sm text-auth-muted">Nhập thông tin tài khoản để tiếp tục</p>

          {error ? (
            <div className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-auth-text">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-auth-primary" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  className="w-full rounded-[10px] border-[1.5px] border-auth-border bg-auth-bg py-3 pl-11 pr-3 text-[15px] font-semibold text-auth-text outline-none transition focus:border-auth-primary focus:bg-white focus:ring-4 focus:ring-auth-primary/15"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-auth-text">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-auth-primary" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  className="w-full rounded-[10px] border-[1.5px] border-auth-border bg-auth-bg py-3 pl-11 pr-12 text-[15px] font-semibold text-auth-text outline-none transition focus:border-auth-primary focus:bg-white focus:ring-4 focus:ring-auth-primary/15"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-auth-muted hover:text-auth-text"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="auth" size="lg" className="w-full rounded-[10px]" loading={submitting}>
              Đăng nhập
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[13px] text-auth-muted">
            <span className="h-px flex-1 bg-auth-border" />
            Tài khoản demo
            <span className="h-px flex-1 bg-auth-border" />
          </div>
          <div className="rounded-xl bg-auth-bg p-4">
            <p className="text-[13px] font-bold text-auth-muted">Chọn nhanh:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["admin@rentalms.com", "admin123", "Admin"],
                ["owner@rentalms.com", "owner123", "Chủ nhà"],
                ["manager@rentalms.com", "manager123", "Quản lý"],
                ["tenant1@rentalms.com", "tenant123", "Người thuê"]
              ].map(([email, pass, label]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email, pass)}
                  className="rounded-lg border-[1.5px] border-auth-border bg-white px-3 py-2 text-xs font-bold text-auth-text transition hover:border-auth-primary hover:text-auth-primary"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-auth-muted">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-extrabold text-auth-primary">
              Đăng ký ngay
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className="font-semibold text-auth-muted hover:text-auth-primary">
              ← Quay về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
