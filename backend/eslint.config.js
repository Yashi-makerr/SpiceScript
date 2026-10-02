const { defineConfig } = require("eslint/config");
const globals = require("globals");

module.exports = defineConfig([
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],

    languageOptions: {
      globals: globals.node
    },

    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
]);