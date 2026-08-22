import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";
import reactPkg from "react/package.json" with { type: "json" };

export default defineConfig(
  // Build artifacts and JS configs: eslint-config-next sets the TS parser
  // globally, and type-aware rules fail on .mjs.
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "next-env.d.ts",
      "eslint.config.mjs",
      "postcss.config.mjs",
      "next.config.ts",
    ],
  },

  // 1. Base JavaScript recommended rules
  js.configs.recommended,

  // 2. Next.js configuration with React, React Hooks, and Next.js rules
  ...next,

  // 3. TypeScript ESLint strict type-checked + stylistic configurations
  //    These provide ~120+ rules for maximum type safety and code style consistency
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylistic,

  // Configure TypeScript parser globally for type-aware rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // eslint-plugin-react 7.37.5 detects the React version via APIs ESLint 10
  // removed; reading it from the installed package skips that codepath.
  { settings: { react: { version: reactPkg.version } } },

  // Custom rule overrides and project-specific tuning
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "warn",

      "@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
      "@typescript-eslint/consistent-indexed-object-style": "warn",

      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "warn",

      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        { allowNumber: true },
      ],

      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-unnecessary-type-parameters": "warn",
      "@typescript-eslint/no-extraneous-class": "warn",

      // Catch-clause variables should be typed unknown (React 19 compat)
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",

      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-confusing-void-expression": "warn",
      "@typescript-eslint/no-unnecessary-condition": "off",

      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "react/no-unescaped-entities": "off",

      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "error",

      "no-console": ["warn", { allow: ["warn", "error", "debug"] }],

      // Warn on lexical declarations in case blocks (let/const in switch)
      "no-case-declarations": "warn",

      // Warn on unnecessary escapes
      "no-useless-escape": "warn",
    },
  },

  // CLI scripts: stdout is the product.
  {
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },

  // Disable ESLint rules that conflict with Prettier formatting.
  // Must come last so it overrides formatting rules from the configs above.
  prettier,
);
