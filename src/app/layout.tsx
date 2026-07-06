import type { Metadata, Viewport } from "next";
import { ChunkLoadRecovery } from "@/components/ChunkLoadRecovery";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tennis Career Atlas",
  description:
    "Powered by WHAT IF ENGINE. Change one comparison condition — Grand Slams, Masters, age, surface, No.1 — and discover how the answer shifts.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ChunkLoadRecovery />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
