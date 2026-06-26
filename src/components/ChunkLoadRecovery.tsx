"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "tca-chunk-reload";

function isChunkLoadFailure(reason: unknown): boolean {
  const message = String(
    reason instanceof Error ? reason.message : reason ?? "",
  );

  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module")
  );
}

export function ChunkLoadRecovery() {
  useEffect(() => {
    sessionStorage.removeItem(RELOAD_FLAG);

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (!isChunkLoadFailure(event.reason)) return;

      if (sessionStorage.getItem(RELOAD_FLAG) === "1") return;

      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
