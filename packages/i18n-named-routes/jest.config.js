const pkg = require('./package.json');
const defaultConfig = require('../../jest.config.base');

module.exports = {
    ...defaultConfig,

    name: pkg.name,
    displayName: pkg.name,
    rootDir: './',

    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
