module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [ '**/tests/**/*.ts', '!**/tests/test.ts' ],
    moduleFileExtensions: [ 'ts', 'js', 'json', 'node' ]
};
