# `@thorgate/spa-pagination`

> Pagination helper for storing queries to fetch next batch of results.


## Basic Usage

```
import { Pagination } from '@thorgate/spa-pagination';

const MyConnectedComponent = ({ fetchSomething }) => (
    <Pagination
        name="something"
        trigger={fetchSomething}
        render={({ loadNext }) => (
            <button onClick={loadNext} />
        )}
    />
);
```
