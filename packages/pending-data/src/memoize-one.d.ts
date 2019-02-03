declare module 'memoize-one' {
    function memoizeOne<T extends (...args: any[]) => any, E>(resultFn: T, isEqual?: EqualityFn<E>): T;

    export type EqualityFn<T> = (newArgs: T, lastArgs: T) => boolean;

    export default memoizeOne;
}
