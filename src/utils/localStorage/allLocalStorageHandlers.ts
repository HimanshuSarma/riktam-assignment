import { GenericObjectType } from "../../types/utils/localStorage/allLocalStorageHandlers";

const setItem = (key: string, payload: any): void => {
    localStorage.setItem(key, JSON.stringify(payload));
};

const getItem = (key: string): GenericObjectType | null => {
    const payloadInString: string | null = localStorage.getItem(key);
    if (typeof payloadInString === 'string') {
        return JSON.parse(payloadInString);
    } else {
        return null;
    }
};

const deleteItem = (key: string): void => {
    localStorage.removeItem(key);
}

export { setItem, getItem, deleteItem };