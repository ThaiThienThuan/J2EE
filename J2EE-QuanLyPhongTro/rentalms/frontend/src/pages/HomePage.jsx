import { Home, Search, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

function Reveal({ children, className = "" }) {
  const { ref, visible } = useRevealOnScroll();
  return (
    <div ref={ref} className={`${visible ? "animate-fade-in opacity-100" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-page-green">
      <section className="relative mt-0 min-h-[calc(100vh-68px)] overflow-hidden bg-gradient-to-br from-[rgba(5,46,22,0.42)] via-[rgba(22,163,74,0.32)] to-[rgba(5,46,22,0.5)] px-[5%] py-16 md:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-[-80px] left-[5%] h-[320px] w-[320px] rounded-full bg-primary-muted/20 blur-[80px]" />
        <div className="relative z-[1] mx-auto flex max-w-7xl flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl flex-1 text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-primary-dark shadow-lg">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Tìm phòng nhanh hơn
              </span>
            </Reveal>
            <Reveal className="mt-7">
              <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-md md:text-5xl lg:text-[56px]">
                Phòng trọ <span className="bg-gradient-to-r from-[#86EFAC] via-primary-light to-white bg-clip-text text-transparent">ưng ý</span> cho bạn
              </h1>
            </Reveal>
            <Reveal className="mt-6">
              <p className="text-[17px] font-semibold leading-relaxed text-white/95 drop-shadow-md">
                RentalMS kết nối chủ nhà và người thuê — xem phòng công khai, theo dõi hợp đồng và hóa đơn minh bạch.
              </p>
            </Reveal>
            <Reveal className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/marketplace"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-white hover:text-primary-dark"
              >
                Xem marketplace
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-btn transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Đăng nhập
              </Link>
            </Reveal>
            <Reveal className="mt-10">
              <div className="inline-flex overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <div className="px-7 py-4 text-center">
                  <p className="text-[28px] font-extrabold text-primary-dark">500+</p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phòng</p>
                </div>
                <div className="my-3 w-px bg-slate-200" />
                <div className="px-7 py-4 text-center">
                  <p className="text-[28px] font-extrabold text-primary-dark">24/7</p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Hỗ trợ</p>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal className="flex flex-1 justify-center">
            <div className="w-full max-w-sm animate-[fadeIn_0.8s_ease-out] md:max-w-md">
              <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
                <div className="relative flex h-[200px] items-center justify-center bg-gradient-to-br from-[#052E16] via-primary-dark to-primary">
                  <Home className="h-20 w-20 text-white/30" strokeWidth={1} />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900">Phòng mẫu trải nghiệm</h3>
                  <p className="mt-1 text-sm text-slate-500">Gần trung tâm, đầy đủ tiện nghi</p>
                  <p className="mt-4 text-[22px] font-extrabold text-primary-dark">
                    3.200.000 đ<span className="text-sm font-medium text-slate-400">/tháng</span>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold text-[#14532D] md:text-4xl">Vì sao chọn TroTot?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-semibold text-green-900/70">
            Giao diện mới giữ tinh thần bản HTML gốc — xanh lá, typography Nunito & Playfair.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "Bảo mật JWT", desc: "Phiên đăng nhập an toàn, token gắn tự động vào mọi API." },
            { icon: Zap, title: "Thao tác nhanh", desc: "Dashboard theo vai trò: tenant, owner, manager, admin." },
            { icon: Search, title: "Marketplace minh bạch", desc: "Danh sách tòa nhà công khai, chi tiết và yêu cầu thuê." }
          ].map((f, i) => (
            <Reveal key={f.title} className={`${i === 1 ? "md:mt-4" : ""}`}>
              <div className="h-full rounded-card-lg border border-green-100 bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white">
                  <f.icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#14532D]">{f.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-green-900/75">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
