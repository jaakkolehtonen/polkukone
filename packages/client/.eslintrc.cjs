module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    extends: ['../../.eslintrc.js', '@vue/typescript/recommended', 'plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
    plugins: ['vue'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.vue'],
    },
    rules: {
        'vue/html-indent': [
            'error',
            4,
            {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            },
        ],
        'vue/multi-word-component-names': 0,
    },
};
