import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import RentalRequestModal from "../../components/tenant/RentalRequestModal";
import Button from "../../components/ui/Button";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { getRole, isLoggedIn } from "../../lib/auth";
import { assertCccdForRental } from "../../lib/rentalGate";
import { formatMoney } from "../../lib/format";

export default function RoomDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const tenantMode = location.pathname.startsWith("/tenant");
  const baseList = tenantMode ? "/tenant/marketplace" : "/marketplace";

  const [galleryIdx, setGalleryIdx] = useState(0);
  const [rentalOpen, setRentalOpen] = useState(false);

  const roomQuery = useQuery({
    queryKey: ["marketplace-room", id],
    queryFn: async () => unwrapData(await api.get(`/api/v1/marketplace/rooms/${id}`))
  });

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => unwrapData(await api.get("/api/v1/profile/me")),
    enabled: tenantMode && isLoggedIn() && getRole() === "TENANT"
  });

  const images = useMemo(() => roomQuery.data?.imageUrls || [], [roomQuery.data?.imageUrls]);

  const openRental = () => {
    if (!isLoggedIn() || getRole() !== "TENANT") {
      navigate("/login");
      return;
    }
    if (!assertCccdForRental(profileQuery.data, navigate)) return;
    setRentalOpen(true);
  };

  if (roomQuery.isLoading) {
    return <LoadingState label="Dang tai thong tin phong..." />;
  }

  if (roomQuery.isError) {
    return <ErrorState message={extractErrorMessage(roomQuery.error)} />;
  }

  const room = roomQuery.data;
  const title = `Phong ${room.roomNumber} - ${room.buildingName || ""}`;
  const totalImg = images.length;
  const showImg = totalImg > 0 ? images[Math.min(galleryIdx, totalImg - 1)] : null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Link to={baseList} className="mb-4 inline-block text-sm font-bold text-primary hover:underline">
        ← Tro ve danh sach
      </Link>

      <div className="overflow-hidden rounded-[28px] border border-green-100 bg-white shadow-soft">
        <div className="relative min-h-[220px] bg-gradient-to-br from-green-100 via-white to-green-50">
          {showImg ? (
            <img src={showImg} alt="" className="h-[320px] w-full object-cover" />
          ) : (
            <div className="flex h-[220px] items-center justify-center text-slate-400">Chua co anh phong</div>
          )}
          {totalImg > 1 ? (
            <>
              <button
                type="button"
                aria-label="Anh truoc"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                onClick={() => setGalleryIdx((i) => (i - 1 + totalImg) % totalImg)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Anh sau"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                onClick={() => setGalleryIdx((i) => (i + 1) % totalImg)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white">
                {galleryIdx + 1}/{totalImg}
              </span>
            </>
          ) : null}
        </div>

        <div className="px-8 py-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-green">Chi tiet phong</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-green-950">{title}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Ma phong (ID): <strong>#{room.id}</strong>
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-extrabold text-slate-900">Thong tin</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>
                    <strong>Gia:</strong> {formatMoney(room.price)} / thang
                  </p>
                  <p>
                    <strong>Dien tich:</strong> {room.area != null ? `${room.area} m²` : "—"}
                  </p>
                  <p>
                    <strong>Giuong:</strong> {room.beds ?? 1}
                  </p>
                  <p>
                    <strong>Toa nha:</strong> {room.buildingName}
                  </p>
                  <p>
                    <strong>Dia chi:</strong> {room.buildingAddress || "—"}
                  </p>
                  <p>
                    <strong>Chu nha:</strong> {room.ownerName || "—"}
                  </p>
                  <p>
                    <strong>Trang thai:</strong> {room.status}
                  </p>
                  {room.amenities ? (
                    <p>
                      <strong>Tien nghi:</strong> {room.amenities}
                    </p>
                  ) : null}
                  {room.description ? <p className="leading-relaxed">{room.description}</p> : null}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-100 bg-green-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-green">Dang ky</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-green-950">Thue phong nay</h3>
              <p className="mt-3 text-sm leading-7 text-green-900/75">
                Dien form ngay bat dau / ket thuc va ghi chu. Can co anh CCCD mat truoc trong ho so.
              </p>

              {isLoggedIn() && getRole() === "TENANT" ? (
                <Button
                  type="button"
                  variant="primary"
                  className="mt-6 w-full"
                  disabled={profileQuery.isLoading}
                  onClick={openRental}
                >
                  Dang ky thue
                </Button>
              ) : (
                <p className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                  Dang nhap vai tro TENANT de gui yeu cau thue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <RentalRequestModal
        open={rentalOpen}
        onClose={() => setRentalOpen(false)}
        presetRoomId={Number(id)}
      />
    </section>
  );
}
