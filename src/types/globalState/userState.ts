import { UserSchemaType } from "../User/UserSchema";

interface UserContextSchemaType extends UserSchemaType {
    token: string
};

interface UserContextType {
    user: UserContextSchemaType | null,
    setUser: React.Dispatch<React.SetStateAction<UserContextSchemaType | null>>,
    isUserDataSet: boolean,
    clearUserState: () => void,
    setUserState: (userData: UserContextSchemaType) => void
};

interface UserStatePropType {
    children: JSX.Element
};



export type { UserContextType, UserStatePropType, UserContextSchemaType };