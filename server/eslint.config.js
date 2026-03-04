import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["node_modules/", "dist/"],
  },
  js.configs.recommended,
  configPrettier,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "import/prefer-default-export": "off",
      "import/extensions": "off",
      "no-console": "warn",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      quotes: ["error", "double"],
    },
  },
];
