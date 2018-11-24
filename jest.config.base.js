// Jest config defaults
const { defaults } = require('jest-config');


module.exports = {
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**',
    ],

    transform: { '.(ts|tsx)': 'ts-jest' },

    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],

    testMatch: [
        '<rootDir>/test/*.test.ts?(x)',
    ],
};
