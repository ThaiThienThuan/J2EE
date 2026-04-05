export default function Dropdown({ id, label, value, onChange, options, className = "" }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-btn border border-border bg-page px-3 py-2.5 text-sm font-semibold text-navy outline-none transition focus:border-secondary focus:bg-surface focus:ring-4 focus:ring-secondary/15"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
