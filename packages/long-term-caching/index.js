'use strict';

const crypto = require('crypto');


const defaultOptions = {
    runtimeChunk: 'single',
    aggressiveCaching: false,
};


module.exports = function razzleLongTermCaching(baseConfig, env, webpack, userOptions = {}) {
    const { target, dev } = env;

    // Clone base config & options
    const options = Object.assign({}, defaultOptions, userOptions);
    const config = Object.assign({}, baseConfig);

    const getFilename = (chunk = false) => dev ? (
        `static/js/[name]${chunk ? '.chunk' : ''}.js`
    ) : (
        `static/js/[name]${chunk ? '.chunk' : ''}.[contenthash:8].js`
    );

    // Target only web
    if (target === 'web') {
        config.output.filename = getFilename();
        config.output.chunkFilename = getFilename(true);

        config.optimization = {
            // Copy base values
            ...config.optimization,

            // And overwrite what we want
            runtimeChunk: options.runtimeChunk,
            splitChunks: {
                chunks: 'all',
                name: false,

                ...(options.aggressiveCaching ? {
                    maxInitialRequests: Infinity,
                    minSize: 0,
                } : {}),

                cacheGroups: {
                    default: false,
                    vendors: { // Override default vendors configuration
                        name: options.aggressiveCaching ? (
                            function (module) {
                                const packageNameMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);

                                if (!packageNameMatch) {
                                    return 'vendors';
                                }

                                // get the name. E.g. node_modules/packageName/not/this/part.js
                                // or node_modules/packageName
                                const packageName = packageNameMatch[1];

                                // In development use real package names
                                if (dev) {
                                    // npm package names are URL-safe, but some servers don't like @ symbols
                                    return `vendors.${packageName.replace('@', '')}`;
                                }

                                // In production use hashed package names
                                return `vendors.${crypto.createHash('md5').update(packageName).digest("hex")}`;
                            }
                        ) : 'vendors',

                        // Include all assets in node_modules directory
                        test: /node_modules/,

                        reuseExistingChunk: true,

                        enforce: true,

                        // Use both async and non-async
                        chunks: 'all',

                        // How many usages is required before they end up in vendor chunk
                        // This is will make clients fetch assets more often but keeps better balance compared to package sizes
                        minChunks: options.aggressiveCaching ? 1 : 2,

                        // Vendors chunk has priority for node_module assets
                        priority: 100,
                    },
                },
            },
        };
    }

    // Return generated config to Razzle
    return config;
};
