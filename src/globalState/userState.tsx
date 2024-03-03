import React, { createContext, useState, useEffect } from 'react';

import { UserSchemaType } from '../types/User/UserSchema';
import { UserContextType, UserContextSchemaType, UserStatePropType } from '../types/globalState/userState';

import { getItem, setItem } from '../utils/localStorage/allLocalStorageHandlers';

const userContext = createContext<UserContextType | null>(null);

const UserContextProvider: React.FC<UserStatePropType> = ({ children }) => {
    const [user, setUser] = useState<UserContextSchemaType | null>(null);
    const [isUserDataSet, setIsUserDataSet] = useState<boolean>(false);

    const setUserState = (userData: UserContextSchemaType) => {
        setUser(userData);
    }

    const clearUserState = () => {
        setUser(null);
    }

    // useEffects start...
    useEffect(() => {
        const user: UserContextSchemaType | null = getItem('user') as UserContextSchemaType | null;
        setUser(user);
    }, []);

    useEffect(() => {
        setIsUserDataSet(true)
    }, [user]);
    // useEffects end...

    return (
        <userContext.Provider value={{ user, setUser, clearUserState, setUserState, isUserDataSet }}>
            {children}
        </userContext.Provider>
    )
};

export default UserContextProvider;
export { userContext };
export type { UserContextType };