import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { formatDateTime } from "../../lib/format";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" }
];

function groupByDay(items) {
  const groups = {};
  (items || []).forEach((n) => {
    const d = (n.createdAt || "").slice(0, 10) || "Khác";
    if (!groups[d]) groups[d] = [];
    groups[d].push(n);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function NotificationsPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [filter, setFilter] = useState("all");

  const query = useQuery({
    queryKey: ["tenant-notifications"],
    queryFn: async () => unwrapData(await api.get("/api/v1/notifications"))
  });

  const selected = useMemo(
    () => (query.data || []).find((item) => item.id === selectedId) || null,
    [query.data, selectedId]
  );

  const filteredList = useMemo(() => {
    const list = query.data || [];
    if (filter === "unread") {
      return list.filter((n) => !n.read && !readIds.includes(n.id));
    }
    return list;
  }, [query.data, filter, readIds]);

  const unreadCount = useMemo(() => {
    return (query.data || []).filter((n) => !n.read && !readIds.includes(n.id)).length;
  }, [query.data, readIds]);

  const openNotification = (notification) => {
    setSelectedId(notification.id);
    setReadIds((current) => (current.includes(notification.id) ? current : [...current, notification.id]));
  };

  const grouped = useMemo(() => groupByDay(filteredList), [filteredList]);

  return (
    <section className="animate-fade-in space-y-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-none border-b border-border bg-surface px-1 py-5 md:px-2">
        <h1 className="flex items-center gap-2 font-display text-xl font-extrabold text-navy md:text-2xl">
          <Bell className="h-7 w-7 text-secondary" />
          Tất cả thông báo
          {unreadCount > 0 ? (
            <span className="ml-2 rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
          ) : null}
        </h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition min-h-[44px] ${
                  filter === f.id
                    ? "border-secondary bg-secondary text-white"
                    : "border-border bg-surface text-muted hover:border-secondary hover:text-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {query.isLoading ? <LoadingState label="Đang tải thông báo..." /> : null}
          {query.isError ? <ErrorState message={extractErrorMessage(query.error)} /> : null}

          {!query.isLoading && !query.isError && filteredList.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-page/40 py-16 text-center text-muted">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="font-semibold">Không có thông báo</p>
            </div>
          ) : null}

          {!query.isLoading &&
            !query.isError &&
            grouped.map(([day, list]) => (
              <div key={day} className="mb-6">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">{day}</p>
                <div className="space-y-3">
                  {list.map((notification) => {
                    const localRead = readIds.includes(notification.id) || notification.read;
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => openNotification(notification)}
                        className={`flex w-full gap-4 rounded-card border p-5 text-left shadow-card transition hover:border-secondary-light hover:shadow-card-hover animate-fade-in ${
                          selectedId === notification.id
                            ? "border-secondary ring-2 ring-secondary/15"
                            : localRead
                              ? "border-border bg-surface"
                              : "border-border bg-[#FFF8F4] pl-4 border-l-4 border-l-secondary"
                        }`}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-secondary/10 text-secondary">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-navy">{notification.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted">{notification.message}</p>
                          <p className="mt-2 text-xs text-muted">{formatDateTime(notification.createdAt)}</p>
                        </div>
                        {!localRead ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <div className="w-full shrink-0 lg:w-[400px]">
          <div className="sticky top-24 overflow-hidden rounded-card border border-border bg-surface shadow-card lg:top-28">
            {selected ? (
              <>
                <div className="border-b border-border px-6 py-5">
                  <span className="rounded-full bg-page px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                    {selected.type}
                  </span>
                  <h2 className="mt-3 font-display text-xl font-extrabold text-navy">{selected.title}</h2>
                  <p className="mt-2 text-xs text-muted">{formatDateTime(selected.createdAt)}</p>
                </div>
                <div className="max-h-[50vh] overflow-y-auto px-6 py-5">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-navy">{selected.message}</p>
                </div>
              </>
            ) : (
              <div className="px-6 py-16 text-center text-muted">
                <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm font-semibold">Chọn một thông báo để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
