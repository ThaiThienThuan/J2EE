import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { extractErrorMessage } from "../../lib/api";
import {
  approveRentalRequest,
  getOwnerRentalRequests,
  rejectRentalRequest
} from "../../lib/ownerApi";
import { formatDate } from "../../lib/format";
import { OwnerHero, StatusBadge, requestStatusClasses, statusBadgeClass } from "./ownerUi.jsx";

const tabs = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function OwnerRentalRequestsPage() {
  const [status, setStatus] = useState("ALL");
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["owner-rental-requests", status],
    queryFn: () => getOwnerRentalRequests(status === "ALL" ? undefined : status)
  });

  const approveMutation = useMutation({
    mutationFn: approveRentalRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-rental-requests"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRentalRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-rental-requests"] });
      queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    }
  });

  if (requestsQuery.isLoading) {
    return <LoadingState label="Dang tai rental requests..." />;
  }

  if (requestsQuery.isError) {
    return <ErrorState message={extractErrorMessage(requestsQuery.error)} />;
  }

  return (
    <section className="space-y-6">
      <OwnerHero
        eyebrow="Rental requests"
        title="Danh sach yeu cau thue"
        description="Tabs doi theo status, action approve/reject dung legacy API nhung duoc invalidate query ngay sau khi thanh cong."
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                status === tab
                  ? "bg-brand-orange text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-brand-orange"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {(requestsQuery.data || []).map((request) => (
            <article key={request.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {request.tenantName} - {request.roomNumber}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{request.buildingName}</p>
                </div>
                <StatusBadge
                  status={request.status}
                  className={statusBadgeClass(requestStatusClasses, request.status)}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p><strong>Email:</strong> {request.tenantEmail}</p>
                <p><strong>Tao luc:</strong> {formatDate(request.createdAt)}</p>
                <p><strong>Bat dau:</strong> {formatDate(request.startDate)}</p>
                <p><strong>Ket thuc:</strong> {formatDate(request.endDate)}</p>
              </div>
              {request.status === "PENDING" ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate(request.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectMutation.mutate(request.id)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}

          {(requestsQuery.data || []).length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Khong co rental request nao cho bo loc nay.</p>
          ) : null}
        </div>

        {approveMutation.isError ? <ErrorState message={extractErrorMessage(approveMutation.error)} /> : null}
        {rejectMutation.isError ? <ErrorState message={extractErrorMessage(rejectMutation.error)} /> : null}
      </div>
    </section>
  );
}
