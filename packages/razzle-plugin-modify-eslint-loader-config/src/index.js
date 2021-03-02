'use strict';

import makeLoaderFinder from 'razzle-dev-utils/makeLoaderFinder';

const eslintLoaderFinder = makeLoaderFinder('eslint-loader');

module.exports = {
    modifyWebpackConfig({ webpackConfig, options: { pluginOptions } }) {
        const eslintLoaderIndex = webpackConfig.module.rules.findIndex(
            eslintLoaderFinder
        );

        if (eslintLoaderIndex !== -1) {
            webpackConfig.module.rules[eslintLoaderIndex].options = {
                ...webpackConfig.module.rules[eslintLoaderIndex].options,
                ...pluginOptions,
            };
        }

        return webpackConfig;
    },
};
