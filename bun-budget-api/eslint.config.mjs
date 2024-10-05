import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  { files: ["**/*.{ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  eslintConfigPrettier, // Disables eslint formatting rules
  eslintPluginPrettierRecommended, // Adds prettier formatting rules to eslint
  ...tseslint.configs.recommended,
  {
    ignores: ["**/out", "**/prisma/client"],
  },
];
