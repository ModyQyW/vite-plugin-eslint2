import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { console: "readonly" },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
