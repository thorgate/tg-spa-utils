[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
# `tg-i18n-named-routes`

A drop-in extension of [tg-named-routes](https://www.npmjs.com/package/tg-named-routes) to provide language specific 
named routes in collaboration with [react-i18next](https://react.i18next.com/).

## Usage


```
yarn add tg-i18n-named-routes
```

**routes.js:**

```diff
- import { buildUrlCache } from 'tg-named-routes';
+ import { buildUrlCache, createLanguageRoutes, storeLanguages, getDefaultLanguageRedirect } from 'tg-i18n-named-routes';
 
- const routes = [
+ const routes = createLanguageRoutes(
+     'et', // default language
+     ['et', 'en'], // all languages
      {
          component: App,
          routes: [
              {
-                 path: '/',
+                 path: {  // provide paths for both languages
+                     et: '/et',
+                     en: '/en',
+                 },
                  name: 'landing',
                  render: props => null,
              },
              {
-                 path: '/uudised',
+                 path: {
+                     et: '/et/uudised',
+                     en: '/en/news',
+                 },
                  name: 'news',
                  render: props => null,
              },
+             getDefaultLanguageRedirect('landing', null) // redirect from / -> /et (the default language)
          ],
      }
  ];
  buildUrlCache(routes);

  export default routes;
```

Next make sure to use i18n specific versions of NamedRedirect and NamedLink. The easiest way to do that is by changing all your imports to use `tg-i18n-named-routes` instead of `tg-named-routes` as this package re-exports everything from original named routes package:

```diff
- import { NamedLink } from 'tg-named-routes';
+ import { NamedLink } from 'tg-i18n-named-routes';
```

Finally replace any usages of resolvePath/stringifyLocation/resolvePattern with hooks based versions:

- resolvePath -> useI18nResolvePath
- stringifyLocation -> useI18nStringifyLocation
- resolvePattern -> useI18nResolvePattern

for example:

```diff
  import { Link } from 'react-router-dom';
- import { resolvePath } from 'tg-named-routes';
+ import { useI18nResolvePath } from 'tg-i18n-named-routes';

  const ExampleComponent = () => {
+     const resolvePath = useI18nResolvePath();
+
      return (
          <Link to={resolvePath('landing')} />
      );
  }
```

## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/tg-i18n-named-routes
[npm-image]: https://img.shields.io/npm/v/tg-i18n-named-routes.svg?style=flat-square

[travis-url]: https://travis-ci.com/thorgate/tg-spa-utils
[travis-image]: https://travis-ci.com/thorgate/tg-spa-utils.svg?branch=master
