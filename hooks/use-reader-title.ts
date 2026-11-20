"use client";

import { useEffect } from "react";

export function useReaderTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    // Next can stream route metadata after the selected edition has rendered.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    apply();
    return () => observer.disconnect();
  }, [title]);
}
