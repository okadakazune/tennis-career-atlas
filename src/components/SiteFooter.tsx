import type { ReactNode } from "react";
import dataSourceMeta from "@/data/data-source-meta.json";

const SACKMANN_URL = "https://github.com/JeffSackmann/tennis_atp";
const BALLDONTLIE_URL = "https://www.balldontlie.io/";
const WIKIMEDIA_URL = "https://commons.wikimedia.org/";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#1d1d1f] underline decoration-black/15 underline-offset-2 transition-colors duration-200 hover:text-[#0071e3] hover:decoration-[#0071e3]/30"
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  const generatedDate = new Date(dataSourceMeta.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" },
  );

  return (
    <footer className="mt-4 border-t border-black/[0.06] pt-8 pb-6 text-xs text-[#86868b] sm:text-sm">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1d1d1f]">
            Data Sources
          </h2>
          <ul className="space-y-1.5">
            <li>
              <FooterLink href={SACKMANN_URL}>Jeff Sackmann</FooterLink>
              <span className="text-[#aeaeb2]"> · historical rankings &amp; Grand Slams</span>
            </li>
            {dataSourceMeta.sources.latest.enabled ? (
              <li>
                <FooterLink href={BALLDONTLIE_URL}>BallDontLie API</FooterLink>
                <span className="text-[#aeaeb2]"> · recent weekly rankings</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1d1d1f]">
            Photos
          </h2>
          <ul className="space-y-1.5">
            <li>
              <FooterLink href={WIKIMEDIA_URL}>Wikimedia Commons</FooterLink>
              <span className="text-[#aeaeb2]"> via Wikidata</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1d1d1f]">
            Disclaimer
          </h2>
          <p className="leading-relaxed">
            Unofficial project.
            <br />
            Not affiliated with the ATP Tour.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1d1d1f]">
            Generated
          </h2>
          <ul className="space-y-1.5">
            <li>{generatedDate}</li>
            {dataSourceMeta.latestWeek ? (
              <li>
                Latest ranking week:{" "}
                <span className="font-medium text-[#1d1d1f]">
                  {dataSourceMeta.latestWeek}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}
