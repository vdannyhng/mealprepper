// Generates the PWA / favicon PNGs from the app logo (Lucide "chef-hat").
// Usage: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const BRAND = "#13804f";
const PATHS = [
  "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z",
  "M6 17h12",
];

/** @param {number} size @param {{ maskable?: boolean, rounded?: boolean }} opts */
async function render(size, { maskable = false, rounded = true } = {}) {
  // Maskable icons need the glyph inside the 80 % safe zone.
  const glyph = Math.round(size * (maskable ? 0.5 : 0.62));
  const svg = h(
    "svg",
    {
      width: glyph,
      height: glyph,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "white",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    ...PATHS.map((d) => h("path", { key: d, d })),
  );
  const root = h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND,
        borderRadius: rounded && !maskable ? size * 0.22 : 0,
      },
    },
    svg,
  );
  const response = new ImageResponse(root, { width: size, height: size });
  return Buffer.from(await response.arrayBuffer());
}

await mkdir("public/icons", { recursive: true });
const outputs = [
  ["public/icons/icon-192.png", 192, {}],
  ["public/icons/icon-512.png", 512, {}],
  ["public/icons/icon-maskable-512.png", 512, { maskable: true }],
  ["src/app/icon.png", 64, {}],
  ["src/app/apple-icon.png", 180, { rounded: false }],
];
for (const [file, size, opts] of outputs) {
  await writeFile(file, await render(size, opts));
  console.log("wrote", file);
}
