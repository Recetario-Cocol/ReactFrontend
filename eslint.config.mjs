import globals from "globals";
import parser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import pluginMarkdown from "eslint-plugin-markdown";
import eslintPluginJson from "eslint-plugin-json";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  // Configuración general para JS/TS
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: ["**/*.json", "**/*.md", "eslint.config.mjs", "webpack.config.js"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      "@typescript-eslint": tseslint,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "error",
    },
  },
  // Configuración específica para TypeScript
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // Configuración para archivos JSON
  {
    files: ["**/*.json"],
    plugins: { json: eslintPluginJson },
    processor: "json/json",
    rules: {
      "json/*": ["error", { allowComments: true }],
      quotes: ["error", "double"],
      "comma-dangle": ["error", "never"],
      "eol-last": ["error", "always"],
    },
  },
  // Configuración para Markdown
  {
    files: ["**/*.md"],
    plugins: { markdown: pluginMarkdown },
    processor: "markdown/markdown", // Usa el procesador de Markdown
    rules: {
      // Desactivar reglas específicas si no quieres linting estricto en Markdown
      "no-undef": "off",
      "no-unused-vars": "off",
      // Puedes añadir reglas específicas para Markdown si lo deseas
    },
  },
  // Ignorar archivos específicos
  {
    ignores: ["build/**", "dist/**", "package-lock.json"],
  },
]);
