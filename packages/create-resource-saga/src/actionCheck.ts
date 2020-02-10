/**
 * @internal
 */
// istanbul ignore next: safeguard against invalid parameters
export function validateResourceAction(
    arg: string | symbol | any,
    position?: number | string,
    parameterType = 'Argument'
) {
    if (position === undefined) {
        position = 1;
    }

    const actionInfo =
        typeof position === 'number'
            ? `#${position}`
            : `property "${position}"`;

    if (arg == null) {
        throw new Error(`${parameterType} (${actionInfo}) is missing`);
    }

    if (typeof arg !== 'string' && typeof arg !== 'symbol') {
        throw new Error(
            `${parameterType} (${actionInfo}) should be of type: string | symbol`
        );
    }
}
