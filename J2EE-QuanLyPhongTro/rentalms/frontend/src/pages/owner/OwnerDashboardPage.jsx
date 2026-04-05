import { useQueries } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  getOwnerBuildings,
  getOwnerContracts,
  getOwnerRentalRequests,
  getOwnerRooms
} from "../../lib/ownerApi";
import { Building2, DoorOpen, FileText, Inbox } from "lucide-react";
import { formatDate } from "../../lib/format";
import {
  OwnerHero,
  SummaryCard,
  StatusBadge,
  requestStatusClasses,
  statusBadgeClass
} from "./ownerUi.jsx";

export default function OwnerDashboardPage() {
  const results = useQueries({
    queries: [
      { queryKey: ["owner-buildings"], queryFn: getOwnerBuildings },
      { queryKey: ["owner-rooms"], queryFn: () => getOwnerRooms({}) },
      { queryKey: ["owner-rental-requests"], queryFn: () => getOwnerRentalRequests() },
      { queryKey: ["owner-contracts"], queryFn: () => getOwnerContracts() }
    ]
  });

  const [buildingsQuery, roomsQuery, requestsQuery, contractsQuery] = results;
  const isLoading = results.some((result) => result.isLoading);
  const failed = results.find((result) => result.isError);

  if (isLoading) {
    return <LoadingState label="Dang tai owner dashboard..." />;
  }

  if (failed) {
    return <ErrorState message={extractErrorMessage(failed.error)} />;
  }

  const buildings = buildingsQuery.data || [];
  const rooms = roomsQuery.data || [];
  const requests = requestsQuery.data || [];
  const contracts = contractsQuery.data || [];
  const pendingRequests = requests.filter((item) => item.status === "PENDING");
  const activeContracts = contracts.filter((item) => item.status === "ACTIVE");
  const recentRequests = [...pendingRequests]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Dashboard"
        title="Tong quan van hanh khu tro"
        description="Owner dashboard tong hop du lieu tu cac owner APIs hien co, khong can summary endpoint rieng."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Building2} tone="orange" label="Tổng tòa nhà" value={buildings.length} hint="Số khu trọ đang quản lý" />
        <SummaryCard icon={DoorOpen} tone="blue" label="Tổng phòng" value={rooms.length} hint="Tồn kho hiện tại" />
        <SummaryCard icon={Inbox} tone="red" label="Request pending" value={pendingRequests.length} hint="Cần xử lý" />
        <SummaryCard icon={FileText} tone="green" label="Hợp đồng active" value={activeContracts.length} hint="Đang hiệu lực" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">Recent pending</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Yeu cau thue moi nhat</h2>
          </div>
        </div>

        {recentRequests.length === 0 ? (
          <p className="mt-6 text-sm font-semibold text-slate-500">Khong co yeu cau pending nao.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {recentRequests.map((request) => (
              <article key={request.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">
                      {request.tenantName} - {request.roomNumber}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{request.buildingName}</p>
                  </div>
                  <StatusBadge
                    status={request.status}
                    className={statusBadgeClass(requestStatusClasses, request.status)}
                  />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <p>
                    <strong>Thoi gian:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                  <p>
                    <strong>Tao luc:</strong> {formatDate(request.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
