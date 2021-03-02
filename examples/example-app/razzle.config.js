'use strict';

module.exports = {
    plugins: [
        'eslint',
        'modify-eslint-loader-config',
        'scss',
        {
            name: 'long-term-caching',
            options: {
                cachingOptions: 'split-size',
            },
        },
    ],
};
