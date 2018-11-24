import { buildUrlCache, getUrlNames, resetUrlCache, resolvePath, resolvePattern } from '../src';


const routes = [
    {
        path: '/',
        name: 'root',
        routes: [
            {
                path: '/',
                name: 'home',
            },
            {
                path: '/param/:id/:pk?',
                name: 'params',
            },
        ],
    },
    {
        path: '/test',
        name: 'test',
    }
];


beforeEach(() => {
    buildUrlCache(routes);
});


describe('Named paths', () => {
    test('Expect missing named routes to throw', () => {
        expect(() => { resolvePath('home2'); }).toThrow();
        expect(() => { resolvePattern('home2'); }).toThrow();
    });

    test('Expect duplicate routes to throw', () => {
        expect(() => {
            resetUrlCache();
            buildUrlCache([
                { path: '/', name: 'home' },
                { path: '/', name: 'home' },
            ]);
        }).toThrow();
    });

    test('Expect empty named parent and children to throw', () => {
        expect(() => {
            resetUrlCache();
            buildUrlCache([{
                path: '/', routes: [{
                    path: '/',
                }]
            }]);
        }).toThrow();
    });

    test('Expect empty url cache throw', () => {
        expect(() => {
            resetUrlCache();
            resolvePath('home');
        }).toThrow();
        expect(() => {
            resetUrlCache();
            resolvePattern('home');
        }).toThrow();
    });

    test('Path matches :: home', () => {
        expect(resolvePath('root:home')).toMatchObject({
            pathname: '/', search: '', state: null, hash: '',
        });
        expect(resolvePath('root:home', null, { test: 1 })).toMatchObject({
            pathname: '/', search: 'test=1', state: null, hash: '',
        });
        expect(resolvePattern('root:home')).toEqual('/');
    });

    test('Path matches :: params', () => {
        expect(() => { resolvePath('root:params'); }).toThrow();
        expect(resolvePath('root:params', {id: 1})).toMatchObject({
            pathname: '/param/1', search: '', state: null, hash: '',
        });
        expect(resolvePath('root:params', {id: 1}, 'test')).toMatchObject({
            pathname: '/param/1', search: 'test', state: null, hash: '',
        });
        expect(resolvePattern('root:params')).toEqual('/param/:id/:pk?');
    });

    test('Correct route names generated', () => {
        expect(getUrlNames()).toEqual(['root', 'root:home', 'root:params', 'test']);
    });
});
