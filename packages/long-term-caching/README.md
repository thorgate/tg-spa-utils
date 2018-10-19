[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

# razzle-plugin-long-term-caching

This package contains a plugin for enabling long-term caching with Razzle

This plugin makes Webpack generate 3 chunks: `runtime`, `vendors` and `client`

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

## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/razzle-plugin-long-term-caching
[npm-image]: https://img.shields.io/npm/v/razzle-plugin-long-term-caching.svg?style=flat-square

[travis-url]: https://travis-ci.com/thorgate/tg-razzle-plugins
[travis-image]: https://travis-ci.com/thorgate/tg-razzle-plugins.svg?branch=master
