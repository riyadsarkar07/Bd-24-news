"use client";

import * as React from "react";

export function useScroll() {
  const [y, setY] = React.useState(0);
  const [direction, setDirection] = React.useState<"up" | "down">("up");

  React.useEffect(() => {
    const handler = () => {
      setY((prev) => {
        setDirection(window.scrollY > prev ? "down" : "up");
        return window.scrollY;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrolled = y > 80;
  return { y, direction, scrolled };
}
