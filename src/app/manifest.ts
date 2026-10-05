import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "MealPrepper",
    short_name: "MealPrepper",
    description: "Meal Prep planen, Makroziele erreichen, Streaks aufbauen.",
    lang: "de",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafcfb",
    theme_color: "#13804f",
    categories: ["food", "health", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Heute", url: "/heute" },
      { name: "Wochenplan", url: "/woche" },
      { name: "Einkaufsliste", url: "/einkaufsliste" },
    ],
  };
}
