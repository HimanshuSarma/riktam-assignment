import React, { useContext } from "react";

import { userContext } from "../../globalState/userState";
import { UserContextType } from "../../globalState/userState";

import { GroupSchemaType } from "../../types/Group/GroupSchema";
import { ChatRoomPropType } from "../../types/Pages/Chats";
import { UserSchemaType } from "../../types/User/UserSchema";
import { UserContextSchemaType } from "../../types/globalState/userState";

import { getFormattedDateFromUnixTimestamp } from "../../utils/dates/getFormattedDate";

import './ChatRoom.css';

const ChatRoom: React.FC<ChatRoomPropType> = ({ name, createdAt, updatedAt, users, admin, chatMessages, isActive }): JSX.Element => {

    // All Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    // All Context API data end...

    return (
        <>
            <div
                className={`chatroom-root`}
            >
                <p>{name}</p>
                <p>Created At: {getFormattedDateFromUnixTimestamp(createdAt)}</p>
                {loggedInUser?._id?.toString() === admin?.toString() ? (
                    <p>Admin</p>
                ) : null}
            </div>
        </>
    );
};

export default ChatRoom;