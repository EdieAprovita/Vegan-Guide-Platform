import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ["e2e/**", ".next/**", ".claude/worktrees/**"] },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error",
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
