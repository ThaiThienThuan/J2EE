export default function StatusCard({ icon: Icon, label, value, hint, tone = "orange", className = "" }) {
  const tones = {
    orange: "bg-secondary/10 text-secondary",
    green: "bg-success/10 text-success",
    blue: "bg-[rgba(100,149,237,0.12)] text-[#6495ED]",
    red: "bg-danger/10 text-danger"
  };
  const box = tones[tone] || tones.orange;
  return (
    <div
      className={`flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${className}`}
    >
      {Icon ? (
        <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] text-[22px] ${box}`}>
          <Icon className="h-6 w-6" strokeWidth={2.2} />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 font-display text-[26px] font-extrabold leading-none text-navy">{value}</p>
        {hint ? <p className="mt-1.5 text-sm font-semibold text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
