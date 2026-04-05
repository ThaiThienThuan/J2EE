import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, unwrapData } from "../../lib/api";
import { formatDateTime } from "../../lib/format";

export default function NotificationBell({ seeAllHref = "/tenant/notifications" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const query = useQuery({
    queryKey: ["header-notifications"],
    queryFn: async () => unwrapData(await api.get("/api/v1/notifications")),
    refetchInterval: 30_000,
    retry: 1
  });

  const list = query.data || [];
  const unread = list.filter((n) => !n.read).length;
  const latest = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-white/20 bg-white/10 text-white/80 transition hover:bg-white/16 hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        {unread > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-extrabold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-[min(360px,92vw)] overflow-hidden rounded-card border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.18)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h4 className="text-sm font-bold text-navy">Thông báo</h4>
            <Link
              to={seeAllHref}
              className="text-xs font-semibold text-secondary hover:underline"
              onClick={() => setOpen(false)}
            >
              Xem tất cả
            </Link>
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {query.isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Đang tải…</p>
            ) : query.isError ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Không tải được thông báo.</p>
            ) : latest.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Chưa có thông báo.</p>
            ) : (
              latest.map((n) => (
                <Link
                  key={n.id}
                  to={seeAllHref}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 border-b border-border px-4 py-3 transition hover:bg-page ${!n.read ? "bg-[#EEF3FF]" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-navy line-clamp-1">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" /> : null}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
