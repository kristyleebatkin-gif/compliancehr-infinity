import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [{
  files: ["src/**/*.{js,jsx}"],
  ignores: ["src/components/ui/**/*"],
  languageOptions: {
    globals: { ...globals.browser, ...globals.node },
    parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
  },
  settings: { react: { version: "detect" } },
  plugins: { react: pluginReact, "react-hooks": pluginReactHooks },
  linterOptions: { reportUnusedDisableDirectives: "off" },
  rules: {
    "no-undef": "error",
    "react/jsx-no-undef": "error",
    "react-hooks/rules-of-hooks": "error",
    "no-dupe-keys": "error",
    "no-unreachable": "error",
    "no-const-assign": "error",
  },
}];
