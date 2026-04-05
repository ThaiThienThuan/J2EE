export default function Card({
  as: Comp = "div",
  variant = "default",
  clickable = false,
  className = "",
  children,
  style,
  ...rest
}) {
  const base =
    "rounded-card border bg-surface shadow-card transition-all duration-200 border-border";
  const highlighted = variant === "highlighted" ? "border-secondary/40 ring-2 ring-secondary/10" : "";
  const hover = clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover" : "";
  return (
    <Comp className={`${base} ${highlighted} ${hover} ${className}`} style={style} {...rest}>
      {children}
    </Comp>
  );
}
