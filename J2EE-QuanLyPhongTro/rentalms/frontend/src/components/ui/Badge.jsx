const statusTone = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border border-emerald-200/80",
  ACTIVE: "bg-emerald-100 text-emerald-800 border border-emerald-200/80",
  PAID: "bg-emerald-100 text-emerald-800 border border-emerald-200/80",
  DONE: "bg-emerald-100 text-emerald-800 border border-emerald-200/80",
  NEW: "bg-green-50 text-green-800 border border-green-200",

  PENDING: "bg-amber-100 text-amber-900 border border-amber-200/80",
  UNPAID: "bg-amber-100 text-amber-900 border border-amber-200/80",

  OCCUPIED: "bg-red-100 text-red-800 border border-red-200/80",
  OVERDUE: "bg-red-100 text-red-800 border border-red-200/80",
  CANCELLED: "bg-red-100 text-red-800 border border-red-200/80",
  REJECTED: "bg-red-100 text-red-800 border border-red-200/80",

  EXPIRED: "bg-slate-200 text-slate-700 border border-slate-300/80",
  TERMINATED: "bg-slate-200 text-slate-700 border border-slate-300/80",

  IN_PROGRESS: "bg-yellow-100 text-yellow-900 border border-yellow-200",

  MAINTENANCE: "bg-orange-100 text-orange-900 border border-orange-200",
  RESERVED: "bg-sky-100 text-sky-800 border border-sky-200",
  HANDOVER: "bg-violet-100 text-violet-900 border border-violet-200",
  PARTIAL: "bg-cyan-100 text-cyan-900 border border-cyan-200",
  PENDING_CONFIRMATION: "bg-violet-100 text-violet-900 border border-violet-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border border-emerald-200/80"
};

const visibilityTone = {
  PUBLIC: "bg-sky-100 text-sky-800 border border-sky-200",
  PRIVATE: "bg-slate-200 text-slate-700 border border-slate-300"
};

export default function Badge({ status, kind = "status", className = "" }) {
  const map = kind === "visibility" ? visibilityTone : statusTone;
  const tone = map[status] || "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${tone} ${className}`}
    >
      {status}
    </span>
  );
}
