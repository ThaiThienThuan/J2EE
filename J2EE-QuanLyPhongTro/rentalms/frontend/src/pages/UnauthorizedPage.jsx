import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-orange">Unauthorized</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">Ban khong co quyen truy cap</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
          Tai khoan hien tai khong phu hop voi route nay. Vui long quay lai khu vuc dung vai tro cua ban.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-700">
            Ve trang chu
          </Link>
          <Link to="/login" className="rounded-xl bg-brand-orange px-5 py-3 text-sm font-extrabold text-white">
            Dang nhap lai
          </Link>
        </div>
      </div>
    </div>
  );
}
