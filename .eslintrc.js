// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
        amd: true
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: ['vue'],
    // add your custom rules here
    rules: {
        'comma-style': 0,
        'brace-style': 0,
        curly: 0,
        // allow async-await
        'generator-star-spacing': 'off',
        indent: 0,
        'arrow-parens': 0,
        'spaced-comment': 0,
        'no-trailing-spaces': 0,
        // object子元素必须不同行
        'no-multiple-empty-lines': 0,
        'no-unused-vars': 0,
        //定义前使用
        'no-use-before-define': 0,
        'no-useless-escape': 0,
        'no-undef': 0,
        'object-property-newline': 0,
        'space-before-function-paren': 0,
        'no-new': 'off',
        'one-var': 'off',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }]
    }
}
