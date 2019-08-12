import { Location } from 'history';
import { useEffect, useState } from 'react';


export function usePendingLocation(location: Location, loadedKey: string | undefined, disabled: boolean = false) {
    const [storedLocation, setStoredLocation] = useState<Location | null>(null);

    // Apply initial location
    useEffect(() => {
        setStoredLocation(location);
    }, []);

    useEffect(() => {
        if ((location.key === loadedKey && !disabled) || disabled) {
            setStoredLocation(location);
        }
    }, [location.key, loadedKey, disabled]);

    return storedLocation || location;
}
