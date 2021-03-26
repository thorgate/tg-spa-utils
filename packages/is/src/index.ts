import is from 'is_js';

// eslint-disable-next-line no-var
declare var global: NodeJS.Global | undefined;

export type OptionalMap<T> = {
    [K in keyof T]?: T[K];
};

export type Kwargs<KW> = { [K in keyof KW]?: string | undefined };

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

export type ThreeWayXOR<P, T, U> = P | T | U extends Record<string, unknown>
    ?
          | (Without<P, U> & Without<T, U> & U)
          | (Without<U, T> & Without<P, T> & T)
          | (Without<T, P> & Without<U, P> & P)
    : P | T | U;

export type SagaFn = (...args: any[]) => Iterator<any>;

export interface RouteSagaObject<U extends any[]> {
    saga: SagaFn;
    args?: U;
}

type HasRenderProp<T, P> = T extends { render: P } ? T : never;
export const hasRenderPropFn = <T extends Record<string, any>, P>(
    value: T
): value is HasRenderProp<T, P> =>
    'render' in value && is.function((value as any).render);

type HasChildrenRenderProp<T, P> = T extends { children: P } ? T : never;
export const hasChildrenRenderPropFn = <T extends Record<string, any>, P>(
    value: T
): value is HasChildrenRenderProp<T, P> =>
    'children' in value &&
    is.function((value as HasChildrenRenderProp<T, P>).children);

export const isNode = (): boolean =>
    typeof global !== 'undefined' &&
    {}.toString.call(global) === '[object global]';

export const isPromise = (prom: any): prom is Promise<any> =>
    prom && is.function(prom.then);

export const isIterable = (it: any): it is Iterable<any> =>
    it && is.function(Symbol)
        ? is.function(it[Symbol.iterator])
        : Array.isArray(it);

export const isIterator = (it: any): it is Iterator<any> =>
    it && is.function(it.next) && is.function(it.throw);

type IsSagaFn<T> = T extends SagaFn ? T : never;
export const isSaga = <T>(fn: T): fn is IsSagaFn<T> => is.function(fn);

type IsFunction<T> = T extends (...args: any[]) => any ? T : never;
export const isFunction = <T extends unknown>(
    value: T
): value is IsFunction<T> => is.function(value);

type IsNumber<T> = T extends number ? T : never;
export const isNumber = <T>(value: T): value is IsNumber<T> => is.number(value);

type IsObject<T> = T extends Record<string, unknown> ? T : never;
export const isObject = <T>(value: T): value is IsObject<T> =>
    value && !Array.isArray(value) && typeof value === 'object';

export const isRouteSagaObject = (obj: any): obj is RouteSagaObject<any[]> =>
    isObject(obj) && 'saga' in obj && isSaga(obj.saga);
