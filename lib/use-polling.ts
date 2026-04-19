"use client";

import { useEffect, useRef } from "react";

type PollingOptions = {
  immediate?: boolean;
};

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  options: PollingOptions = {},
) {
  const { immediate = false } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (immediate) {
      void callbackRef.current();
    }

    const intervalId = window.setInterval(() => {
      void callbackRef.current();
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [immediate, intervalMs]);
}
