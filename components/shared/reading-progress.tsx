"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);
  const reduce = useReducedMotion();
  const scaleX = useSpring(progress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (reduce) return null;

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-brand-500 to-accentblue"
      style={{ scaleX }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
