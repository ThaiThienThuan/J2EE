import StatusCard from "../../components/ui/StatusCard";

export const roomStatusClasses = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-orange-100 text-orange-700",
  MAINTENANCE: "bg-red-100 text-red-700",
  RESERVED: "bg-sky-100 text-sky-700",
  HANDOVER: "bg-violet-100 text-violet-700"
};

export const requestStatusClasses = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700"
};

export const contractStatusClasses = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-slate-200 text-slate-700",
  TERMINATED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700"
};

export const billStatusClasses = {
  UNPAID: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  PARTIAL: "bg-sky-100 text-sky-700",
  PENDING_CONFIRMATION: "bg-violet-100 text-violet-700"
};

export function statusBadgeClass(map, status) {
  return map[status] || "bg-slate-100 text-slate-700";
}

export function OwnerHero({ eyebrow, title, description }) {
  return (
    <div className="rounded-card-lg bg-gradient-to-r from-navy via-[#2D1B69] to-navy px-6 py-8 text-white shadow-soft md:px-8 animate-fade-in">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/60">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-bold md:text-5xl">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{description}</p> : null}
    </div>
  );
}

export function SummaryCard({ icon, label, value, hint, tone = "orange" }) {
  return <StatusCard icon={icon} label={label} value={value} hint={hint} tone={tone} />;
}

export function StatusBadge({ status, className }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${className}`}>
      {status}
    </span>
  );
}
