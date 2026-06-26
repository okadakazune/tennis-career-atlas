"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white px-6 antialiased">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-[#1d1d1f]">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
            The app failed to load. This can happen after a new deployment. Try
            reloading the page.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] hover:bg-[#fafafa]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Reload page
            </button>
          </div>
          {process.env.NODE_ENV !== "production" && error.message ? (
            <p className="mt-4 break-all text-left text-xs text-red-600">
              {error.message}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
