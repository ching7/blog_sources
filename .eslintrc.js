// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  // required to lint *.vue files
  plugins: [
    'vue',
    'project'
  ],
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  "settings": {
    "projectRulesDir": "build/toolbox/lint"
  },
  // add your custom rules here
  rules: {
    // allow async-await
    'camelcase': "off",
    'no-console': 'error',
    'generator-star-spacing': 'off',
    // allow debugger during development
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': 'error',
    'no-callback-literal': 0,
    // 'project/no-chinese-lang-in-string': 'error' 中文检测
    // 'project/selector-demo': 'error' 这就是一个demo
    'project/no-import-frame-src': 'error',
    'project/unit-text-should-has-format-type': 'error'
  }
}
