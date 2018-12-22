'use strict';


const defaultOptions = {
    runtimeChunk: 'single',
    vendorsMinUsed: 2,
};


module.exports = function razzleLongTermCaching(baseConfig, env, webpack, baseOptions) {
    const { target, dev } = env;

    // Clone base config & options
    const options = Object.assign({}, baseOptions || {}, defaultOptions);
    const config = Object.assign({optimization: {}}, baseConfig);

    const getFilename = ext => dev ? `static/${ext}/[name].${ext}` : `static/${ext}/[name].[contenthash:16].${ext}`;

    // Target only web
    if (target === 'web') {
        config.output.filename = getFilename('js');

        config.optimization = {
            // Copy base values
            ...config.optimization,

            // And overwrite what we want
            splitChunks: {
                chunks: 'all',
                name: false,

                cacheGroups: {
                    default: false,
                    vendors: { // Override default vendors configuration
                        name: 'vendors',

                        // Include all assets in node_modules directory
                        test: /node_modules/,

                        reuseExistingChunk: true,

                        enforce: true,

                        // Use both async and non-async
                        chunks: 'all',

                        // How many usages is required before they end up in vendor chunk
                        // This is will make clients fetch assets more often but keeps better balance compared to package sizes
                        minChunks: options.vendorsMinUsed,

                        // Vendors chunk has priority for node_module assets
                        priority: 100,
                    },
                },
            },
        };

        config.optimization.runtimeChunk = options.runtimeChunk;
    }

    // Return generated config to Razzle
    return config;
};
