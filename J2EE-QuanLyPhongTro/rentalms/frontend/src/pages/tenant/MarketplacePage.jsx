import { useQuery } from "@tanstack/react-query";
import { Building2, LayoutGrid, MapPin, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RentalRequestModal from "../../components/tenant/RentalRequestModal";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { getRole, isLoggedIn } from "../../lib/auth";
import { assertCccdForRental } from "../../lib/rentalGate";
import { formatMoney } from "../../lib/format";
import Badge from "../../components/ui/Badge";

const cats = [
  { id: "", label: "Tất cả", icon: LayoutGrid },
  { id: "phong tro", label: "Phòng trọ", icon: Building2 },
  { id: "nha nguyen can", label: "Nhà nguyên căn", icon: Building2 },
  { id: "can ho", label: "Căn hộ", icon: Building2 }
];

export default function MarketplacePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tenantMode = location.pathname.startsWith("/tenant");
  const basePath = tenantMode ? "/tenant/marketplace" : "/marketplace";

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("priceAsc");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [rentalOpen, setRentalOpen] = useState(false);
  const [rentalRoomId, setRentalRoomId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["marketplace-rooms"],
    queryFn: async () => unwrapData(await api.get("/api/v1/marketplace/rooms"))
  });

  const contractsQuery = useQuery({
    queryKey: ["tenant-contracts"],
    queryFn: async () => unwrapData(await api.get("/api/v1/tenant/contracts")),
    enabled: tenantMode
  });

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => unwrapData(await api.get("/api/v1/profile/me")),
    enabled: tenantMode && isLoggedIn() && getRole() === "TENANT"
  });

  const hasActiveContract = useMemo(
    () => (contractsQuery.data || []).some((c) => c.status === "ACTIVE"),
    [contractsQuery.data]
  );

  const filtered = useMemo(() => {
    let list = [...(data || [])];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((room) => {
        const name = `Phong ${room.roomNumber || ""}`.toLowerCase();
        return (
          name.includes(q) ||
          (room.buildingName || "").toLowerCase().includes(q) ||
          (room.buildingAddress || "").toLowerCase().includes(q) ||
          (room.description || "").toLowerCase().includes(q)
        );
      });
    }
    if (cat) {
      list = list.filter(
        (room) =>
          (room.description || "").toLowerCase().includes(cat) ||
          (room.buildingName || "").toLowerCase().includes(cat)
      );
    }
    if (priceMax) {
      const max = Number(priceMax);
      if (!Number.isNaN(max)) {
        list = list.filter((room) => {
          const p = Number(room.price);
          return !p || p <= max;
        });
      }
    }
    if (areaMin) {
      const min = Number(areaMin);
      if (!Number.isNaN(min)) {
        list = list.filter((room) => {
          const a = Number(room.area);
          return !a || a >= min;
        });
      }
    }
    if (sort === "priceAsc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "priceDesc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sort === "name") {
      list.sort((a, b) =>
        `${a.buildingName || ""} ${a.roomNumber || ""}`.localeCompare(
          `${b.buildingName || ""} ${b.roomNumber || ""}`
        )
      );
    }
    return list;
  }, [data, search, cat, sort, priceMax, areaMin]);

  const roomLink = (id) => `${basePath}/rooms/${id}`;

  const openRental = (roomId) => {
    if (!tenantMode || !isLoggedIn() || getRole() !== "TENANT") {
      navigate("/login");
      return;
    }
    if (!assertCccdForRental(profileQuery.data, navigate)) return;
    setRentalRoomId(roomId);
    setRentalOpen(true);
  };

  const isTenant = tenantMode && isLoggedIn() && getRole() === "TENANT";

  return (
    <div className="animate-fade-in space-y-0">
      {!tenantMode ? (
        <header className="sticky top-[68px] z-[40] border-b-2 border-primary bg-surface shadow-sm">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-2.5">
            <Link to="/marketplace" className="flex shrink-0 items-center gap-2">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-primary text-lg font-extrabold text-white">
                R
              </span>
              <div className="leading-tight">
                <p className="text-lg font-extrabold text-[#052E16]">RentalMS</p>
                <p className="text-[10px] text-slate-400">Kênh phòng trọ uy tín</p>
              </div>
            </Link>
            <div className="flex min-w-[200px] max-w-md flex-1 items-center overflow-hidden rounded-md border-[1.5px] border-slate-200 bg-white focus-within:border-primary">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                placeholder="Tìm phòng, tòa nhà, địa chỉ..."
                className="min-h-11 flex-1 border-none px-3 py-2 text-[13px] font-semibold text-slate-800 outline-none"
              />
              <span className="flex min-h-11 items-center bg-primary px-4 text-[13px] font-bold text-white">
                <Search className="mr-1 h-3.5 w-3.5" />
                Tìm
              </span>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-surface">
            <div className="mx-auto flex max-w-[1200px] gap-0 overflow-x-auto px-2">
              {cats.map((c) => {
                const Icon = c.icon;
                const active = cat === c.id;
                return (
                  <button
                    key={c.id || "all"}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-semibold transition ${
                      active ? "border-primary text-primary-dark" : "border-transparent text-slate-400 hover:text-primary-dark"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
          <div className="flex min-w-[200px] flex-1 items-center overflow-hidden rounded-md border border-slate-200 bg-page focus-within:border-primary">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm phòng, tòa nhà, địa chỉ..."
              className="min-h-11 flex-1 border-none bg-transparent px-3 text-sm font-semibold outline-none"
            />
            <Search className="mr-3 h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}

      {tenantMode && hasActiveContract ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            Bạn đang có hợp đồng thuê đang hiệu lực!
          </span>
          <Link
            to="/tenant/bills"
            className="rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-white transition hover:bg-secondary-dark"
          >
            Vào dashboard / hóa đơn
          </Link>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Phòng trống ({filtered.length})</h1>
              <p className="text-xs text-slate-500">Lọc & sắp xếp trên danh sách phòng AVAILABLE</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "priceAsc", label: "Giá ↑" },
                { id: "priceDesc", label: "Giá ↓" },
                { id: "name", label: "Tên A-Z" }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold transition ${
                    sort === s.id ? "border-primary bg-green-50 text-primary-dark" : "border-slate-200 text-slate-500 hover:border-primary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? <LoadingState label="Đang tải danh sách phòng..." /> : null}
          {isError ? <ErrorState message={extractErrorMessage(error)} /> : null}

          {!isLoading && !isError && filtered.length === 0 ? (
            <EmptyState title="Không có phòng phù hợp" description="Thử bỏ bớt bộ lọc hoặc từ khóa tìm kiếm." />
          ) : null}

          {!isLoading &&
            !isError &&
            filtered.map((room, index) => {
              const title = `Phòng ${room.roomNumber} - ${room.buildingName || ""}`;
              const img = (room.imageUrls && room.imageUrls[0]) || null;
              const tags = (room.amenities || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
              return (
                <Card
                  key={room.id}
                  clickable
                  className="mb-3 overflow-hidden p-0 animate-fade-in hover:border-green-200"
                  style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className={`relative flex min-h-[164px] w-full shrink-0 items-center justify-center sm:w-[220px] ${
                        img ? "" : "bg-gradient-to-br from-[#052E16] via-primary-dark to-primary"
                      }`}
                    >
                      {img ? (
                        <img src={img} alt="" className="h-full min-h-[164px] w-full object-cover sm:w-[220px]" />
                      ) : (
                        <Building2 className="h-14 w-14 text-white/25" />
                      )}
                      <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        AVAILABLE
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          to={roomLink(room.id)}
                          className="line-clamp-2 text-[15px] font-extrabold text-slate-900 hover:text-primary-dark"
                        >
                          {title}
                        </Link>
                        <Badge status={room.status || "AVAILABLE"} />
                      </div>
                      <p className="text-base font-extrabold text-listing">
                        {formatMoney(room.price)}
                        <span className="text-xs font-semibold text-slate-500"> /tháng</span>
                        <span className="mx-1 text-slate-400">|</span>
                        <span className="text-[13px] font-semibold text-slate-600">
                          {room.area != null ? `${room.area} m²` : "—"} · {room.beds ?? 1} giường
                        </span>
                      </p>
                      <p className="flex items-start gap-1 text-xs text-slate-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {room.buildingAddress || "Đang cập nhật địa chỉ"}
                      </p>
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.map((t) => (
                            <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="line-clamp-2 text-xs text-slate-400">{room.description || "Xem chi tiết để biết thêm."}</p>
                      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                        <span className="text-xs font-bold text-slate-500">Chủ: {room.ownerName || "—"}</span>
                        <div className="ml-auto flex flex-wrap gap-2">
                          <Link to={roomLink(room.id)}>
                            <Button type="button" variant="secondary" size="sm" className="rounded-md">
                              Xem chi tiết
                            </Button>
                          </Link>
                          {isTenant ? (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="rounded-md"
                              disabled={profileQuery.isLoading}
                              onClick={() => openRental(room.id)}
                            >
                              Đăng ký thuê
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>

        <aside className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-card border border-border bg-surface p-4 shadow-card">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
              <span className="text-primary">◆</span> Bộ lọc
            </p>
            <label className="text-xs font-bold text-slate-500">Giá tối đa (VNĐ)</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="VD: 5000000"
            />
            <label className="mt-3 block text-xs font-bold text-slate-500">Diện tích tối thiểu (m²)</label>
            <input
              type="number"
              value={areaMin}
              onChange={(e) => setAreaMin(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="VD: 15"
            />
          </div>
        </aside>
      </div>

      <RentalRequestModal
        open={rentalOpen}
        onClose={() => {
          setRentalOpen(false);
          setRentalRoomId(null);
        }}
        presetRoomId={rentalRoomId}
      />
    </div>
  );
}
