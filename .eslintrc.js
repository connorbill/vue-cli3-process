
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true
  },
  plugins: [
    "vue",
    "prettier"
  ],
  extends: [
    "plugin:vue/recommended",
    "prettier",
    // "plugin:prettier/recommended",
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": ["error"],
  },
  parserOptions: {
    "parser": "babel-eslint",
    // "ecmaVersion": 2017,
    "sourceType": "module",
    // "ecmaFeatures": {
    //   "jsx": true
    // }
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
