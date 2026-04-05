import {
  Building2,
  ClipboardList,
  FileText,
  Gauge,
  Hammer,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ScrollText,
  Shield,
  Store,
  UserCircle,
  Users,
  Wrench,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getUser } from "../../lib/auth";
import { getInitials } from "../../lib/format";
import NotificationBell from "../ui/NotificationBell";

const iconMap = {
  dashboard: LayoutDashboard,
  marketplace: Store,
  buildings: Building2,
  rooms: Home,
  requests: Inbox,
  contracts: FileText,
  bills: Receipt,
  maintenance: Wrench,
  notifications: ClipboardList,
  profile: UserCircle,
  managers: Users,
  meters: Gauge,
  audit: ScrollText,
  users: Users,
  reports: FileText,
  bugs: Hammer,
  admin: Shield
};

function RoleBadge({ role }) {
  const map = {
    ADMIN: "border border-red-200 bg-red-50 text-red-800",
    OWNER: "border border-orange-200 bg-orange-50 text-orange-800",
    MANAGER: "border border-green-200 bg-green-50 text-green-800",
    TENANT: "border border-blue-200 bg-blue-50 text-blue-900"
  };
  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide md:inline-flex ${map[role] || map.TENANT}`}
    >
      {role}
    </span>
  );
}

export default function DashboardLayout({
  role,
  navItems,
  workspaceEyebrow,
  workspaceSubtitle,
  showMarketplaceLink = false,
  notificationSeeAll = "/tenant/notifications"
}) {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const NavContent = ({ onNavigate }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-secondary text-white shadow-lg shadow-orange-900/20"
                  : "text-white/70 hover:translate-x-1 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-cream/90 animate-fade-in" />
                ) : null}
                <Icon className="relative h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-page">
      <header className="fixed inset-x-0 top-0 z-[100] flex h-16 items-center gap-2 border-b border-white/5 bg-navy px-3 shadow-[0_2px_12px_rgba(0,0,0,0.18)] md:gap-4 md:px-7">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label="Menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <NavLink to={role === "TENANT" ? "/tenant/marketplace" : `/${role.toLowerCase()}/dashboard`} className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-secondary text-sm font-black text-white md:h-10 md:w-10">
            <Home className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="hidden font-display text-lg font-bold text-white sm:inline md:text-xl">
            Rental<span className="text-cream">MS</span>
          </span>
        </NavLink>

        <div className="mx-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 md:flex lg:justify-center">
          {navItems.slice(0, 8).map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            return (
              <NavLink
                key={`top-${item.to}`}
                to={item.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[13px] font-semibold transition ${
                    isActive
                      ? "border-transparent bg-secondary text-white"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="hidden xl:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {showMarketplaceLink ? (
            <NavLink
              to="/tenant/marketplace"
              className="hidden items-center gap-2 rounded-lg border border-white/20 bg-[rgba(46,204,113,0.15)] px-3 py-2 text-xs font-bold text-white/90 transition hover:bg-[rgba(46,204,113,0.28)] sm:flex"
            >
              <Store className="h-3.5 w-3.5" />
              Marketplace
            </NavLink>
          ) : null}

          {role === "ADMIN" ? (
            <NavLink
              to="/admin/audit"
              className="hidden items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 sm:flex"
            >
              <ScrollText className="h-3.5 w-3.5" />
              Audit logs
            </NavLink>
          ) : (
            <NotificationBell seeAllHref={notificationSeeAll} />
          )}

          <RoleBadge role={role} />

          <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-white md:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-black">
              {getInitials(user?.fullName)}
            </span>
            <div className="max-w-[140px] truncate text-left">
              <p className="truncate text-xs font-bold">{user?.fullName}</p>
              <p className="truncate text-[10px] text-white/60">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[140] lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />
          <div className="absolute left-0 top-0 flex h-full w-[min(300px,88vw)] flex-col bg-navy p-4 shadow-xl animate-slide-in-right">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-white">
                Rental<span className="text-cream">MS</span>
              </span>
              <button type="button" className="rounded-lg p-2 text-white/80 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-shell pt-16">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-sidebar shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-navy px-4 py-8 text-white lg:flex">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Xin chào</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white">{user?.fullName}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{workspaceSubtitle}</p>
          </div>
          <div className="mt-8 flex-1">
            <NavContent />
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-64px)] min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b border-border bg-surface px-4 py-4 shadow-sm md:px-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">{workspaceEyebrow}</p>
            <p className="mt-1 text-sm text-muted">{workspaceSubtitle}</p>
          </div>
          <main className="flex-1 px-4 py-6 md:px-7">
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
