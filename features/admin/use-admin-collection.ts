"use client";

import * as React from "react";

type Subscriber<T> = (
  listener: (rows: T[]) => void,
  onError?: (err: unknown) => void,
) => () => void;

/**
 * Subscribes to a realtime/polling collection and exposes consistent
 * loading and error state for admin tables.
 */
export function useAdminCollection<T>(subscribe: Subscriber<T>) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribe(
      (rows) => {
        if (!mounted) return;
        setData(rows);
        setError(false);
        setLoading(false);
      },
      () => {
        if (!mounted) return;
        setError(true);
        setLoading(false);
      },
    );
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [subscribe]);

  return { data, setData, loading, error };
}
