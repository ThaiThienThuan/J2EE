import { Inbox } from "lucide-react";

export default function EmptyState({ title, description, icon: Icon = Inbox, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-page/50 px-6 py-16 text-center ${className}`}
    >
      <Icon className="mb-4 h-14 w-14 text-muted/40" strokeWidth={1.25} />
      <p className="font-display text-lg font-bold text-navy">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm font-semibold text-muted">{description}</p> : null}
    </div>
  );
}
