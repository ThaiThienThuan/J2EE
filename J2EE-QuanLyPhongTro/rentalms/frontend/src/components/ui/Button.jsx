import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-br from-primary to-primary-dark text-white shadow-btn hover:shadow-lg hover:shadow-primary/30",
  secondary:
    "bg-gradient-to-br from-secondary to-secondary-dark text-white shadow-md shadow-secondary/25 hover:shadow-lg",
  ghost: "border border-white/25 bg-white/10 text-white hover:bg-white/16",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white",
  muted: "border border-border bg-page text-navy hover:bg-slate-200/80",
  auth: "bg-auth-primary text-white hover:bg-auth-primary-dark shadow-md hover:shadow-lg"
};

const sizes = {
  sm: "min-h-9 px-3 py-2 text-xs rounded-lg",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-btn",
  lg: "min-h-12 px-6 py-3 text-base rounded-xl"
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled,
  children,
  type = "button",
  ...rest
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 ${v} ${s} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
