# `@thorgate/spa-components`

> Common components used with [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)


## Usage

```
import '@thorgate/spa-components/dist/message-panel.css';

import { PageError, Status } from '@thorgate/spa-components';


// Somewhere in the dom tree to render permission denied.
<PageError statusCode={403}>
    Very bad, you should not have come. Meow.
</PageError>

// Or use Status to create custom error component
<Status code={404}>
    Terribly sorry, I have lost what you are looking for.
</Status>
```
