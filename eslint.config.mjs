import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "supabase/**",
      "src/types/database.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/supabase-js", "@supabase/ssr"],
              message: "Supabase nur über src/lib/supabase bzw. die Feature-Data-Layer verwenden.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/lib/supabase/**"],
    rules: { "no-restricted-imports": "off" },
  },
];

export default config;
