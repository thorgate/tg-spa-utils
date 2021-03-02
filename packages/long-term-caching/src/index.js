'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

const defaultSizeLimits = {
    minSize: 30000,
    maxSize: 200000,
};

const defaultOptions = {
    runtimeChunk: 'single',
    cachingOptions: false,
    vendorsChunkName: 'vendors',
    sizeOptions: defaultSizeLimits,
};

const outputName = (dev, chunk = false) =>
    dev
        ? `static/js/[name]${chunk ? '.chunk' : ''}.js`
        : `static/js/[name]${chunk ? '.chunk' : ''}.[contenthash:8].js`;

const createCachingGroups = cachingGroups => {
    const filters = [];

    if (Array.isArray(cachingGroups)) {
        cachingGroups.forEach(key => {
            filters.push({
                test: new RegExp(`${key}`),
                name: key,
            });
        });
    } else {
        Object.keys(cachingGroups).forEach(key => {
            let test = null;
            const moduleCheck = cachingGroups[key];

            if (moduleCheck instanceof RegExp) {
                test = moduleCheck;
            } else if (Array.isArray(moduleCheck)) {
                test = new RegExp(`(${moduleCheck.join('|')})`);
            } else {
                throw new Error('cachingGroups expected Array or Regex');
            }

            filters.push({
                test,
                name: key,
            });
        });
    }

    return function(packageName) {
        const matching = filters.find(group => group.test.test(packageName));

        if (matching) {
            return matching.name;
        }

        return null;
    };
};

module.exports = {
    modifyWebpackConfig({
        env: { target, dev },
        webpackConfig,
        options: { pluginOptions },
    }) {
        // Clone base config & options
        const options = Object.assign({}, defaultOptions, pluginOptions);
        const config = Object.assign({}, webpackConfig);

        let { cachingOptions } = options;

        // Fallback to renamed property
        if (options.aggressiveCaching) {
            cachingOptions = options.aggressiveCaching;
        }

        const splitWithSize = cachingOptions === 'split-size';

        let getCacheGroup = null;
        if (
            !(
                cachingOptions === true ||
                cachingOptions === false ||
                splitWithSize
            )
        ) {
            getCacheGroup = createCachingGroups(cachingOptions);
        }

        const { vendorsChunkName } = options;
        let { sizeOptions } = options;
        sizeOptions = Object.assign({}, defaultSizeLimits, sizeOptions || {});

        let vendorsName;
        if (cachingOptions && !splitWithSize) {
            vendorsName = function(module) {
                const packageNameMatch = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                );

                if (!packageNameMatch) {
                    return vendorsChunkName;
                }

                // get the name of the vendor chunk
                let packageName = packageNameMatch[1];

                if (getCacheGroup) {
                    const grouping = getCacheGroup(packageName);

                    if (!grouping) {
                        return vendorsChunkName;
                    }

                    packageName = grouping;
                }

                // In development use real package names
                if (dev) {
                    // npm package names are URL-safe, but some servers don't like @ symbols
                    return `${vendorsChunkName}.${packageName.replace(
                        '@',
                        ''
                    )}`;
                }

                // In production use hashed package names 16 first characters
                const hashedName = crypto
                    .createHash('md5')
                    .update(packageName)
                    .digest('hex');
                return `${vendorsChunkName}.${hashedName.slice(0, 16)}`;
            };
        } else {
            vendorsName = vendorsChunkName;
        }

        // Target only web
        if (target === 'web') {
            config.output.filename = outputName(dev);
            config.output.chunkFilename = outputName(dev, true);

            config.optimization = {
                // Copy base values
                ...config.optimization,

                // And overwrite what we want
                runtimeChunk: options.runtimeChunk,
                splitChunks: {
                    chunks: 'all',
                    name: false,

                    ...(cachingOptions && !splitWithSize
                        ? {
                              maxInitialRequests: Infinity,
                              minSize: 0,
                          }
                        : {}),

                    ...(splitWithSize
                        ? {
                              ...sizeOptions,
                              maxInitialRequests: 10,
                          }
                        : {}),

                    cacheGroups: {
                        default: false,
                        vendors: {
                            // Override default vendors configuration
                            name: vendorsName,

                            // Include all assets in node_modules directory
                            test: /node_modules/,

                            reuseExistingChunk: true,

                            enforce: true,

                            // Use both async and non-async
                            chunks: 'all',

                            // How many usages is required before they end up in vendor chunk
                            // This is will make clients fetch assets more often but keeps better balance compared to package sizes
                            minChunks: 1,

                            // Vendors chunk has priority for node_module assets
                            priority: 100,

                            ...(splitWithSize
                                ? {
                                      ...sizeOptions,
                                  }
                                : {}),
                        },
                    },
                },
            };
        }

        // Return generated config to Razzle
        return config;
    },
};
