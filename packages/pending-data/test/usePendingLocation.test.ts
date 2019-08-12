import '@testing-library/jest-dom/extend-expect';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History, Location } from 'history';

import { usePendingLocation } from '../src/usePendingLocation';


let history: History;

beforeEach(() => {
    history = createMemoryHistory();
});
afterEach(cleanup);

describe('usePendingLocation', () => {
    test('initial location set correctly', () => {
        let storedLocation: Location = { ...history.location };

        renderHook(() => {
            storedLocation = usePendingLocation({ ...history.location }, history.location.key);
        });

        expect(storedLocation).toEqual(history.location);
    });

    test('disabled=true', () => {
        let storedLocation: Location = { ...history.location };
        let loadingKey = history.location.key;

        const { rerender } = renderHook(() => {
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

        const { rerender } = renderHook(() => {
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
