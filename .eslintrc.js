module.exports = {
  root: true,
  env: {
    node: true
  },
  "plugins": ["prettier"],
  extends: ["plugin:vue/essential", "@vue/prettier","eslint:recommended"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": "error"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)", "vue.config.js"],
      env: {
        jest: true
      }
    }
  ]
};
