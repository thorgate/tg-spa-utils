[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

# razzle-plugin-long-term-caching

This package contains a plugin for enabling long-term caching with Razzle

This plugin makes Webpack generate 3 chunks: `runtime`, `vendors` and `client`.

Don't forget to add `REACT_BUNDLE_PATH=/static/js/vendors.js` to `.env` or `.env.development`
to get built-in error overlay.


## Usage in Razzle Projects

```
yarn add razzle-plugin-long-term-caching
```

Using the plugin with the default options

```js
// razzle.config.js

module.exports = {
  plugins: ['long-term-caching'],
};
```

### With custom options:

```js
// razzle.config.js

module.exports = {
  plugins: [
    {
      name: 'long-term-caching',
      options: {
        runtimeChunk: 'single',
      },
    },
  ],
};
```

## Options

**runtimeChunk: _object_ _string_ _boolean_** (defaults: 'single')

Customize runtime chunk behaviour, this is directly provided to Webpack config

**aggressiveCaching: _boolean_** (defaults: false)

Enable per-package vendor (node_modules) splitting for bigger initial download but smaller patches later on. This option works best with HTTP/2.

## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/razzle-plugin-long-term-caching
[npm-image]: https://img.shields.io/npm/v/razzle-plugin-long-term-caching.svg?style=flat-square

[travis-url]: https://travis-ci.com/thorgate/tg-spa-utils
[travis-image]: https://travis-ci.com/thorgate/tg-spa-utils.svg?branch=master
