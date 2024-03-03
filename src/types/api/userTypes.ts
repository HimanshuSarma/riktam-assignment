import { UserSchemaType } from "../User/UserSchema";

interface UserLoginResponseType {
    payload: {
        user: {
            _id: string,
            name: string,
            updatedAt: string,
            createdAt: string,
            __v?: number
        },
        token: string
    }
};

interface GetAllUsersResponseType {
    payload: {
        users: Array<UserSchemaType>
    }
};

interface GetAllUsersInGivenChatRoomResponseType {
    payload: {
        _id: string,
        users: Array<UserSchemaType>,
        admin: UserSchemaType
    }
}

export type { UserLoginResponseType, GetAllUsersResponseType, GetAllUsersInGivenChatRoomResponseType };