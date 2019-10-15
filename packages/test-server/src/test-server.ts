import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaHelmet from 'koa-helmet';
import koaLogger from 'koa-logger';
import KoaResponseTime from 'koa-response-time';
import KoaRouter from 'koa-router';
import uuid from 'uuid';

const port = 3001;

interface Item {
    pk: string;
    name: string;
}

interface Data {
    [id: string]: Item;
}

const configureApiRoutes = () => {
    const items: Data = {};

    const router = new KoaRouter({
        prefix: '/api',
        strict: true,
    });

    router.get('/items', ctx => {
        ctx.status = 200;
        ctx.body = Object.values(items);
    });
    router.post('/items', ctx => {
        const pk = uuid.v4();

        const { name } = ctx.request.body;

        items[pk] = {
            pk,
            name,
        };

        ctx.status = 201;
        ctx.body = items[pk];
    });
    router.get('/items/:id', ctx => {
        const { pk } = ctx.params;

        if (!items[pk]) {
            ctx.status = 404;
            ctx.body = { detail: 'not found' };
        } else {
            ctx.status = 200;
            ctx.body = items[pk];
        }
    });
    router.patch('/items/:id', ctx => {
        const { pk } = ctx.params;
        const { name } = ctx.request.body;

        if (!items[pk]) {
            ctx.status = 404;
            ctx.body = { detail: 'not found' };
        } else {
            items[pk].name = name;

            ctx.status = 200;
            ctx.body = items[pk];
        }
    });

    return router;
};

export const listen = (p: number = port, logger: boolean = false) => {
    const router = configureApiRoutes();

    const server = new Koa();

    if (logger) {
        server.use(koaLogger());
    }

    server
        .use(KoaResponseTime())
        .use(koaHelmet())
        .use(koaBody())
        .use(router.routes())
        .use(router.allowedMethods());

    return server.listen(p);
};
