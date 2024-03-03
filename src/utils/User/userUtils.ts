import { deleteItem, setItem } from "../localStorage/allLocalStorageHandlers";

import { UserSchemaType } from "../../types/User/UserSchema";
import { UserContextSchemaType } from "../../types/globalState/userState";

const storeUserDetails = (user: UserSchemaType) => {
    setItem('user', user);
};

const logoutUser = (clearUserState: (() => void) | undefined) => {
    deleteItem('user');
    clearUserState?.();
};

const loginUser = (userData: UserContextSchemaType, setUserState: ((user: UserContextSchemaType) => void) | undefined) => {
    storeUserDetails(userData);
    setUserState?.(userData);
};

export { storeUserDetails, loginUser, logoutUser };