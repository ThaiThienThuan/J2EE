export function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto rounded-card border border-border bg-surface shadow-card ${className}`}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead>
      <tr className="border-b border-border bg-page text-xs font-bold uppercase tracking-wide text-muted">{children}</tr>
    </thead>
  );
}

export function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}

export function Tbody({ children, striped = true }) {
  return (
    <tbody className={striped ? "[&>tr:nth-child(even)]:bg-page/80 [&>tr:hover]:bg-page" : "[&>tr:hover]:bg-page/60"}>
      {children}
    </tbody>
  );
}

export function Tr({ children, className = "" }) {
  return <tr className={`border-b border-border last:border-0 ${className}`}>{children}</tr>;
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-3.5 align-middle text-navy ${className}`}>{children}</td>;
}

/** Stack rows as cards on small screens — pass same cells as compact blocks */
export function ResponsiveTable({ table, cards, className = "" }) {
  return (
    <div className={className}>
      <div className="hidden md:block">{table}</div>
      <div className="space-y-3 md:hidden">{cards}</div>
    </div>
  );
}
