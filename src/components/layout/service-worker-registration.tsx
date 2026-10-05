"use client";

import { useEffect } from "react";

/** Registers /sw.js in production builds (offline fallback, cached static assets). */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Offline support is progressive enhancement; the app works without it.
    });
  }, []);
  return null;
}
