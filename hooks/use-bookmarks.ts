"use client";

import * as React from "react";
import { useLocalStorage } from "./use-local-storage";

export type BookmarkItem = { slug: string; title: string; category: string; image: string; publishedAt: string };

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkItem[]>("bd24news_bookmarks", []);

  const isBookmarked = React.useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks],
  );

  const toggleBookmark = React.useCallback(
    (item: BookmarkItem) => {
      setBookmarks((prev) =>
        prev.some((b) => b.slug === item.slug) ? prev.filter((b) => b.slug !== item.slug) : [item, ...prev],
      );
    },
    [setBookmarks],
  );

  const removeBookmark = React.useCallback(
    (slug: string) => setBookmarks((prev) => prev.filter((b) => b.slug !== slug)),
    [setBookmarks],
  );

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}

export type ReadingHistoryItem = { slug: string; title: string; category: string; image: string; readAt: string };

export function useReadingHistory() {
  const [history, setHistory] = useLocalStorage<ReadingHistoryItem[]>("bd24news_history", []);

  const addToHistory = React.useCallback(
    (item: Omit<ReadingHistoryItem, "readAt">) => {
      setHistory((prev) => [
        { ...item, readAt: new Date().toISOString() },
        ...prev.filter((h) => h.slug !== item.slug),
      ].slice(0, 50));
    },
    [setHistory],
  );

  return { history, addToHistory };
}
