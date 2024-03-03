import React from "react";

import { ChatSchema } from "../Chat/ChatSchema";
import { GroupSchemaType } from "../Group/GroupSchema";
import { MapFormStatePayloadType } from "../utils/formUtils";
import { UserSchemaType } from "../User/UserSchema";

type updateChatMessagesArgsPayloadType = Array<ChatSchema> | ChatSchema | { messageId: string, roomId: string };
type updateChatMessagesArgsActionType = 'setMessages' | 'editMessage' | 'newMessage';

type updateChatMessagesArgsType = {
    action: 'setMessages',
    payload: {
        chatMessages: Array<ChatSchema>,
        roomId: string
    }
} | {
    action: 'newMessage',
    payload: ChatSchema
} | {
    action: 'editMessage',
    payload: ChatSchema
} | {
    action: 'deleteMessage',
    payload: { messageId: string, roomId: string }
};

interface ChatRoomPropType extends GroupSchemaType {
    chatMessages?: Array<ChatSchema>
};

interface AllChatMessagesType {
    [key: string]: Array<ChatSchema>
};

interface ChatWindowPropType {
    roomId: string,
    chatRoomMessages: Array<ChatSchema>,
    chatRoom: GroupSchemaType,
    updateChatMessagesHandler: (payload: updateChatMessagesArgsType) => void,
    allChatRooms: Array<GroupSchemaType>,
    setAllChatRooms: React.Dispatch<React.SetStateAction<Array<GroupSchemaType>>>,
    setCurrentChatRoom: React.Dispatch<React.SetStateAction<GroupSchemaType>>,
};


interface CreateNewGroupPropType {
    createNewChatRoomHandler: (payload: MapFormStatePayloadType) => void
};

type UserTypes = 'Normal' | 'Admin'

interface UserInChatRoom extends UserSchemaType {
    userType: UserTypes
};

type OnAddUsersInChatRoomHandlerArgsType = {
    updatedChatRoom: GroupSchemaType,
    chatMessages: Array<ChatSchema>
};

export type { 
    ChatWindowPropType, AllChatMessagesType, updateChatMessagesArgsType, 
    updateChatMessagesArgsActionType, updateChatMessagesArgsPayloadType,
    CreateNewGroupPropType, UserInChatRoom, OnAddUsersInChatRoomHandlerArgsType,
    ChatRoomPropType
};