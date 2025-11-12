// @ts-check

/**
 * @type{import('prettier').Config}
 */
const config = {
  tabWidth: 2,
  printWidth: 80,
  proseWrap: "always",
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
  singleAttributePerLine: true,
  endOfLine: "lf",
  singleQuote: false,
  semi: true,
  useTabs: false,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^(react/(.*)$)|^(react$)|^(react-dom$)|^(react-dom/(.*)$)",
    "",
    "^(@chakra-ui/(.*)$)",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};

module.exports = config;
