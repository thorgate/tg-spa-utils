import { createLocationAction, ViewManagerWorker } from '@thorgate/spa-view-manager';
import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import Helmet from 'react-helmet';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import { RenderChildren } from 'tg-named-routes';

import { configureStore } from './store';
import routes from './views';


const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const mainEntryPoints = ['runtime', 'vendors', 'client'];

const scripts = mainEntryPoints.reduce((scripts, key) => {
    if (!assets[key] || !assets[key].js) {
        return scripts;
    }

    return `${scripts}<script src="${assets[key].js}" defer crossorigin></script>`;
}, '');

const styles = mainEntryPoints.reduce((styles, key) => {
    if (!assets[key] || !assets[key].css) {
        return styles;
    }

    return `${styles}<link rel="stylesheet" href="${assets[key].css}" crossorigin />`;
}, '');


const asyncWrapper = (fn) => (req, res, next) => (
    Promise.resolve(fn(req, res, next)).catch(next)
);


const server = express();
server
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
    .get('/*', asyncWrapper(async (req, res) => {
        const { store } = configureStore({}, {
            location: req.originalUrl,
        });

        const task = store.runSaga(ViewManagerWorker, routes, createLocationAction(store.getState().router));

        store.close();

        await task.toPromise();

        const context = {};
        const markup = renderToString(
            <Provider store={store}>
                <StaticRouter context={context} location={req.url}>
                    <RenderChildren routes={routes} />
                </StaticRouter>
            </Provider>,
        );

        if (context.url) {
            res.redirect(context.url);
        } else {
            const header = Helmet.renderStatic();
            const state = serialize(store.getState());

            res.status(context.statusCode || 200).send(
                `<!doctype html>
<html ${header.htmlAttributes.toString()}>
    <head>
        ${header.title.toString()}
        ${header.link.toString()}
        ${header.meta.toString()}
        ${header.style.toString()}
        ${styles}
    </head>
    <body ${header.bodyAttributes.toString()}>
        <div id="root">${markup}</div>
        ${scripts}
    </body>
    <script>
        window.__initial_state__ = ${state};
    </script>
</html>
`,
            );
        }
    }));

export default server;
