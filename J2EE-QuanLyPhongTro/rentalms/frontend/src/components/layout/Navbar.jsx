import { Link, NavLink } from "react-router-dom";
import { getUser, isLoggedIn } from "../../lib/auth";
import { getInitials } from "../../lib/format";

const publicLinks = [
  { to: "/", label: "Trang chu" },
  { to: "/marketplace", label: "Marketplace" }
];

export default function Navbar() {
  const user = getUser();
  const tenantLoggedIn = isLoggedIn() && user?.role === "TENANT";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-green to-brand-green-dark text-lg font-black text-white shadow-lg shadow-green-500/30">
            H
          </span>
          <span className="font-display text-2xl font-bold text-green-950">
            Tro<span className="text-brand-green">Tot</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-bold transition ${
                  isActive ? "text-brand-green" : "text-green-900 hover:text-brand-green"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {tenantLoggedIn ? (
            <Link
              to="/tenant"
              className="flex items-center gap-3 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-xs font-black text-white">
                {getInitials(user.fullName)}
              </span>
              <span className="hidden md:block">{user.fullName}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border-2 border-brand-green px-4 py-2 text-sm font-extrabold text-brand-green transition hover:bg-brand-green hover:text-white"
              >
                Dang nhap
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-brand-green to-brand-green-dark px-4 py-2 text-sm font-extrabold text-white shadow-md shadow-green-500/30 transition hover:-translate-y-0.5"
              >
                Dang ky
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
