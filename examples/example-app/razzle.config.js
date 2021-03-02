'use strict';

module.exports = {
    plugins: ['scss', {
        name: 'long-term-caching',
        options: {
            cachingOptions: 'split-size',
        },
    }],
};
