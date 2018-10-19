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
