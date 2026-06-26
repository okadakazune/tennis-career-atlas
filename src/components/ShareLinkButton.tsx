"use client";

import { useCallback, useRef, useState } from "react";

interface ShareLinkButtonProps {
  getShareUrl: () => string;
}

export function ShareLinkButton({ getShareUrl }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    const url = getShareUrl();

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [getShareUrl]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex items-center justify-center rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] transition-colors hover:border-black/[0.12] hover:bg-[#fafafa]"
    >
      {copied ? "Copied" : "Copy share link"}
    </button>
  );
}
