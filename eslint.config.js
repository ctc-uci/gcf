import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ["**/*.{ts,tsx,js,jsx}"],
  ignores: ["dist", "server/**/*", "client/**/*"], //
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {
    eqeqeq: "error",
    "no-unused-vars": "off",
    "max-lines": ["error", { max: 1000 }],
    "no-restricted-syntax": [
      "error",
      {
        selector: "JSXIdentifier[name='div']",
        message: "Using <div> tags is not allowed. Use Chakra UI components (Box, Stack, etc.) instead.",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
});
