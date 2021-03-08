[![Build Status][gh-actions-image]][gh-actions-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]


# Thorgate's collection of utility packages for Single-page applications

[![Greenkeeper badge](https://badges.greenkeeper.io/thorgate/tg-spa-utils.svg)](https://greenkeeper.io/)

This is combination of utility packages used at [Thorgate](https://thorgate.eu).

## Packages included:

Some of the packages are used by [Thorgate project template (SPA variant)](https://gitlab.com/thorgate-public/django-project-template/tree/spa).

* [components](packages/components/README.md) - common components used with SPA template
* [create-resource-saga](packages/create-resource-saga/README.md) -  helper for creating [Redux-Saga](https://github.com/redux-saga/redux-saga)s to fetch and store resources
* [entities](packages/entities/README.md) - normalized data storage helper
* [errors](packages/errors/README.md) - error handling helpers used by SPA template
* [forms](packages/forms/README.md) - helper for creating [Redux-Saga](https://github.com/redux-saga/redux-saga)s for saving forms
* [is](packages/is/README.md) - internal type checking library for packages in SPA template
* [loading-bar](packages/loading-bar/README.md) - controlled loading bar component
* [named-routes](packages/named-routes/README.md) - routes helper library to add named routes via [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config)
* [pending-data](packages/pending-data/README.md) - pending data manager used by SPA template
* [pagination](packages/pagination/README.md) - pagination helpers for use with entities
* [permissions](packages/permissions/README.md) - permissions helpers used by SPA template
* [saga-manager](packages/saga-manager/README.md) - helper to hot-reload [Redux-Saga](https://github.com/redux-saga/redux-saga)s
* [view](packages/view/README.md) - [Redux-Saga](https://github.com/redux-saga/redux-saga) runners used by SPA template
* [view-manager](packages/view-manager/README.md) - view helpers used by SPA template 


## Running the example app

To run the example web application, install the dependencies and build the packages first:

Install dependencies
```
yarn install
yarn bootstrap
```

Build the packages
```
yarn build
```

Start the example app (based on Razzle, see [readme](examples/example-app/README.md))
```
yarn start-example
```

The example app runs on [http://localhost:4000](http://localhost:4000)

Please check the [contributing guidelines](CONTRIBUTING.md) if you proceed with your own changes before you start.

## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/tg-spa-utils
[npm-image]: https://img.shields.io/npm/v/tg-spa-utils.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/thorgate/tg-spa-utils?branch=master
[coveralls-image]: https://coveralls.io/repos/github/thorgate/tg-spa-utils/badge.svg?branch=master

[gh-actions-url]: https://github.com/thorgate/razzle-plugins/actions/workflows/main.yml
[gh-actions-image]: https://github.com/thorgate/razzle-plugins/actions/workflows/main.yml/badge.svg?branch=master
