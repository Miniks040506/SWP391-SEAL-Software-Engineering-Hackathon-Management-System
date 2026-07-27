import { useCallback, useEffect, useState } from "react";

type ScrollRevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Reveals an element once it scrolls into view. Reveal is one-way: the observer
 * disconnects on first intersection so scrolling back up never re-hides content.
 *
 * The observed node is tracked in state through a callback ref, not a plain ref:
 * panels here mount late (behind async query data), and a ref alone is not
 * reactive, so the observer would never attach to a node that appears after the
 * first commit.
 *
 * Users who ask for reduced motion get the revealed state immediately, so the
 * content is never gated behind an animation they have opted out of.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
) {
  const { threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = options;
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((instance: T | null) => setNode(instance), []);
  const [revealed, setRevealed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (revealed || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, revealed, threshold, rootMargin]);

  return { ref, revealed };
}
