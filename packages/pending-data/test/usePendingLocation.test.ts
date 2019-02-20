import { createMemoryHistory, History, Location } from 'history';
import 'jest-dom/extend-expect';
import { cleanup, testHook } from 'react-testing-library';

import { usePendingLocation } from '../src/usePendingLocation';


let history: History;

beforeEach(() => {
    history = createMemoryHistory();
});
afterEach(cleanup);

describe('usePendingLocation', () => {
    test('initial location set correctly', () => {
        let storedLocation: Location = { ...history.location };

        testHook(() => {
            storedLocation = usePendingLocation({ ...history.location }, history.location.key);
        });

        expect(storedLocation).toEqual(history.location);
    });

    test('disabled=true', () => {
        let storedLocation: Location = { ...history.location };
        let loadingKey = history.location.key;

        const { rerender } = testHook(() => {
            storedLocation = usePendingLocation({ ...history.location }, loadingKey, true);
        });

        expect(storedLocation).toEqual(history.location);

        history.push('/test');
        storedLocation = { ...history.location };
        rerender();
        expect(storedLocation).toEqual(history.location);

        loadingKey = history.location.key;
        rerender();
        expect(storedLocation).toEqual(history.location);
    });

    test('loading key updates work', () => {
        let storedLocation: Location = { ...history.location };
        let loadingKey = history.location.key;

        const { rerender } = testHook(() => {
            storedLocation = usePendingLocation({ ...history.location }, loadingKey);
        });

        expect(storedLocation).toEqual(history.location);

        history.push('/test');
        storedLocation = { ...history.location };
        rerender();
        expect(storedLocation).not.toEqual(history.location);

        loadingKey = history.location.key;
        rerender();
        expect(storedLocation).toEqual(history.location);
    });
});
