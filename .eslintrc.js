// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: [    'plugin:vue/recommended',
  'eslint:recommended',
  'plugin:prettier/recommended',],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow debugger during development
    "vue/require-default-prop": "off",
    "vue/attribute-hyphenation": "off",
    "prettier/prettier": [
      "warn",
      {
        "singleQuote": true, // 用单引号
        "semi": false, // 句末加分号
        "trailingComma": 'none', // 添加尾逗号
      }
    ]  
  }
}
