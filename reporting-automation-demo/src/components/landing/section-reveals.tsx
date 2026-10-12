"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: content stays visible without JS or with reduced motion. */
export function SectionReveals({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? []);
    let observer: IntersectionObserver | undefined;
    const configure = () => {
      observer?.disconnect();
      elements.forEach((element) => delete element.dataset.revealState);
      if (media.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.revealState = "visible";
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.08 });
      for (const element of elements) {
        if (element.getBoundingClientRect().top > window.innerHeight) {
          element.dataset.revealState = "pending";
          observer.observe(element);
        }
      }
    };
    configure();
    media.addEventListener("change", configure);
    return () => { observer?.disconnect(); media.removeEventListener("change", configure); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
