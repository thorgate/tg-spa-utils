# `@thorgate/spa-view`

> View helpers used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

Wrap your components into Views using withView helper to take advantage of:
* ErrorBoundary (see [errors](../errors/README.md))
* Passing user and authentication information to children
* If not supported by the browser (or turned off), managing and restoring scroll position so
  that the content does not jump on loading

[view-manager](../view-manager/README.md) has to be set up to take full advantage of features Views provide.

## Usage:

```js
import React from 'react';
import { connectView } from '@thorgate/spa-view';

const withView = target => (
    connectView({ onComponentError: (error) => { console.log(error); }})(target)
);

class Home extends React.Component {
    render() {
        return (
            <div className="Home">
                <p className="Home-intro">
                    To get started, edit <code>src/App.js</code> or{' '}
                    <code>src/Home.js</code> and save to reload.
                </p>
            </div>
        );
    }
}

export default withView(Home);
```
