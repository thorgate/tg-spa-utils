type StorageType = Storage | null;


export class SafeStorage {
    protected storageObject: StorageType;

    constructor(storageObject: StorageType = null) {
        this.storageObject = storageObject;
    }

    public get length() {
        if (this.storageObject) {
            return this.storageObject.length;
        }

        return 0;
    }

    public getItem(key: string) {
        if (this.storageObject) {
            return this.storageObject.getItem(key);
        }

        return null;
    }

    public setItem(key: string, value: string) {
        if (this.storageObject) {
            this.storageObject.setItem(key, value);
        }
    }

    public removeItem(key: string) {
        if (this.storageObject) {
            this.storageObject.removeItem(key);
        }
    }

    public clear() {
        if (this.storageObject) {
            this.storageObject.clear();
        }
    }
}
