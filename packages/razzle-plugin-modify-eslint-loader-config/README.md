[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

# razzle-plugin-modify-eslint-loader-config

This package contains a plugin which can be used to modify eslint loader config
## Usage in Razzle Projects

```
yarn add razzle-plugin-modify-eslint-loader-config
```

Using the plugin with the default options

```js
// razzle.config.js

module.exports = {
  plugins: [
    'eslint',
    'modify-eslint-loader-config' // This plugin should always be after eslint plugin
  ],
};
```

### With custom options:

```js
// razzle.config.js

module.exports = {
  plugins: [
    'eslint',
    {
      // This plugin should always be after eslint plugin
      name: 'modify-eslint-loader-config',
      options: {
        fix: true,  // enable autofix
      },
    },
  ],
};
```

## Options

NB: By default this plugin sets `emitWarning` to true to force eslint errors to be shown as warnings (so compilation still succeeds).

see https://github.com/webpack-contrib/eslint-loader#options

## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/razzle-plugin-modify-eslint-loader-config
[npm-image]: https://img.shields.io/npm/v/razzle-plugin-modify-eslint-loader-config.svg?style=flat-square

[travis-url]: https://travis-ci.com/thorgate/tg-spa-utils
[travis-image]: https://travis-ci.com/thorgate/tg-spa-utils.svg?branch=master
