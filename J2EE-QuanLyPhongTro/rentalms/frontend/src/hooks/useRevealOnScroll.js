import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (options.once !== false) obs.disconnect();
        }
      },
      { rootMargin: options.rootMargin || "0px 0px -8% 0px", threshold: options.threshold ?? 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [options.once, options.rootMargin, options.threshold]);

  return { ref, visible };
}
