import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative z-[1] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card-lg border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.25)] animate-slide-in-right ${className}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <h3 className="font-display text-lg font-bold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
