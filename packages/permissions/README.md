# `@thorgate/spa-permissions`

> Permissions helpers used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

Used by [view](../view/README.md) to provide user and authentication information stored
in Redux state to the components inside the view. Consider using [view](../view/README.md) and 
[view-manager](../view-manager/README.md) with this package.

## Usage

### LoginRequired 
If used as decorator on a component, displays "Insufficient permissions" error message to unauthenticated
users instead.
```js
import { loginRequired } from '@thorgate/spa-permissions';
import React from 'react';

const Restricted = () => (
    <div>If you can see this, you are authenticated</div>
);

export default loginRequired(Restricted);
```

### Checking for other permissions

In a similar way as `LoginRequired`, more complex functions with signature `permissionCheckFn: (props) => boolean`
may be used to define view access permissions. Wrap's base view with `permissionCheck` decorator 
to handle permission check.

```js
import { permissionCheck } from '@thorgate/spa-permissions';
import React from 'react';

const checkIfNotAuthenticated = ({ isAuthenticated }) => !isAuthenticated;

const RestrictedToGuests = () => (
        <div>If you can see this, you are not authenticated</div>
);

export default permissionCheck(checkIfNotAuthenticated)(RestrictedToGuests);
```

It is also possible to use `PermissionCheck` component directly.
