'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');

const eslintLoaderFinder = makeLoaderFinder('eslint-loader');

module.exports = {
    modifyWebpackConfig({ webpackConfig, options: { pluginOptions } }) {
        const eslintLoaderIndex = webpackConfig.module.rules.findIndex(
            eslintLoaderFinder
        );

        if (eslintLoaderIndex !== -1) {
            webpackConfig.module.rules[eslintLoaderIndex].options = {
                ...webpackConfig.module.rules[eslintLoaderIndex].options,
                emitWarning: true,
                ...pluginOptions,
            };
        }

        return webpackConfig;
    },
};
