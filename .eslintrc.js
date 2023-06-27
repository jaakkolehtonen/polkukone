module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    plugins: [
        '@typescript-eslint',
        'deprecation',
        'eslint-comments',
        'eslint-plugin',
        'import',
        'jest',
        'simple-import-sort',
        'unicorn',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
    },
    rules: {
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        'deprecation/deprecation': 'error',
        'prettier/prettier': 'error',
        '@typescript-eslint/explicit-function-return-type': 1,
        '@typescript-eslint/no-explicit-any': 1,
        '@typescript-eslint/type-annotation-spacing': 1,
        '@typescript-eslint/no-inferrable-types': [
            'warn',
            {
                ignoreParameters: true,
            },
        ],
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'variable',
                format: ['camelCase'],
            },
            {
                selector: 'function',
                format: ['camelCase'],
            },
            {
                selector: 'class',
                format: ['PascalCase'],
            },
            {
                selector: 'interface',
                format: ['PascalCase'],
            },
            {
                selector: 'typeAlias',
                format: ['PascalCase'],
            },
            {
                selector: 'enum',
                format: ['PascalCase'],
            },
            {
                selector: 'variable',
                types: ['boolean'],
                format: ['camelCase', 'PascalCase'],
                prefix: ['is', 'has', 'should'],
            },
            {
                selector: 'variable',
                modifiers: ['const'],
                format: ['camelCase', 'UPPER_CASE'],
            },
            {
                selector: 'parameter',
                format: ['camelCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'memberLike',
                modifiers: ['private'],
                format: ['camelCase'],
                leadingUnderscore: 'require',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: 'enumMember',
                format: ['PascalCase', 'camelCase'],
            },
            {
                selector: 'property',
                format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
            },
            {
                selector: 'method',
                format: ['camelCase'],
            },
            {
                selector: 'typeParameter',
                format: ['PascalCase'],
                prefix: ['T'],
            },
        ],
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-absolute-path': 'error',
        'import/no-amd': 'error',
        'import/no-default-export': 'error',
        'import/no-duplicates': 'error',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
                peerDependencies: true,
                optionalDependencies: false,
            },
        ],
        'import/no-mutable-exports': 'error',
        'import/no-named-default': 'error',
        'import/no-named-export': 'off',
        'import/no-self-import': 'error',
        'import/prefer-default-export': 'off',
        'simple-import-sort/imports': 'error',
    },
    settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
};
