# `@thorgate/spa-is`

> Internal type checking library for SPA packages used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

## Available object type checks:
* `isRouteSagaObject(obj)`
* `isIterable(obj)`
* `isIterator(obj)`
* `isPromise(obj)`

## Avalable utility checks:
* `isNode()` - true if running on node, false if running in browser

## Usage:

```javascript
import { isNode } from '@thorgate/spa-is';

let history;
if (isNode()) {
    history = createMemoryHistory();
} else {
    history = createBrowserHistory();
}
```
