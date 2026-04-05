import { useLayoutEffect, useRef, useState } from "react";

export default function Tabs({ tabs, value, onChange, className = "" }) {
  const rowRef = useRef(null);
  const btnRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === value));

  useLayoutEffect(() => {
    const row = rowRef.current;
    const btn = btnRefs.current[activeIndex];
    if (!row || !btn) return;
    const rl = row.getBoundingClientRect();
    const bl = btn.getBoundingClientRect();
    setIndicator({ left: bl.left - rl.left, width: bl.width });
  }, [activeIndex, tabs, value]);

  return (
    <div className={`relative rounded-[10px] bg-page p-1 ${className}`}>
      <div className="relative" ref={rowRef}>
        <div
          className="pointer-events-none absolute bottom-0 top-0 rounded-lg bg-surface shadow-md transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        <div className="relative z-[1] flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              onClick={() => onChange(tab.id)}
              className={`min-h-[44px] flex-1 rounded-lg px-3 py-2.5 text-center text-[13px] font-bold transition-colors ${
                value === tab.id ? "text-secondary" : "text-muted hover:text-navy"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
