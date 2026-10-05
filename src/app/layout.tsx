import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
import { publicEnv } from "@/lib/env";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl()),
  title: { default: "MealPrepper", template: "%s · MealPrepper" },
  description: "Meal Prep planen, Makroziele erreichen, Streaks aufbauen.",
  applicationName: "MealPrepper",
  appleWebApp: { capable: true, title: "MealPrepper", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1512" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Applies the theme before first paint to avoid a light/dark flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
