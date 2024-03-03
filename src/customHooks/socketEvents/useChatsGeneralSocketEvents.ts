import React, { useEffect, useContext } from "react";
import { toast } from 'react-toastify';

import { socketConnection } from "../../api/socketConnection";

import { userContext } from "../../globalState/userState";
import { UserContextType } from "../../globalState/userState";

import { UserContextSchemaType } from "../../types/globalState/userState";
import { GroupSchemaType } from "../../types/Group/GroupSchema";
import { MapFormStatePayloadType } from "../../types/utils/formUtils";
import { OnAddUsersInChatRoomHandlerArgsType } from "../../types/Pages/Chats";
import { ChatSchema } from "../../types/Chat/ChatSchema";
import { OnListenerResponseType } from "../../types/api/socketResponseTypes";

import { successToastMessage, errorToastMessage } from "../../utils/userNotifications/toastUtils";

const useChatsGeneralSocketEvents = (
    chatRooms: Array<GroupSchemaType>, 
    setAllChatRooms: React.Dispatch<React.SetStateAction<Array<GroupSchemaType>>>,
    roomId: string,
    getMessagesOnAddToChatRoomHandler: (chatMessages: Array<ChatSchema>) => void
) => {

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    const setUserState: ((userData: UserContextSchemaType) => void) | undefined = userContextData?.setUserState;
    // Context API data end...

    // Handlers start...
    // emit handlers start...
    const createNewChatRoomHandler = (payload: MapFormStatePayloadType) => {
        console.log(payload, 'createNewChatRoomHandler');
        socketConnection.emit(`addChatRoom`, { name: payload?.name, users: payload?.users, token: loggedInUser?.token });
    }
    // emit handlers end...

    // on listeners start...
    const onAddUsersInChatRoomHandler = (res: OnListenerResponseType) => {
        console.log(res, chatRooms, 'addUsersInChatRoomBroadcast');

        let isUserAlreadyInChatRoom: boolean = false;

        for (let i = 0; i < chatRooms?.length; i++) {
            if (chatRooms?.[i]?._id === res?.payload?.updatedChatRoom?._id) {
                isUserAlreadyInChatRoom = true;         
            }
        };

        if (!isUserAlreadyInChatRoom) {
            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return [...allChatRooms, res?.payload?.updatedChatRoom];
            });
        } else {
            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return allChatRooms?.map?.((currChatRoom: GroupSchemaType) => {
                    if (currChatRoom?._id === res?.payload?.updatedChatRoom?._id) {
                        return res?.payload?.updatedChatRoom;
                    } else {
                        return currChatRoom;
                    }
                })
            });
        }

        getMessagesOnAddToChatRoomHandler(res?.payload?.chatMessages);
    };

    const onRemoveUsersInChatRoomHandler = (res: OnListenerResponseType) => {
        // Notify the user that the user is removed from the chat room...
        if (res?.success && res?.payload?.updatedChatRoom) {
            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return allChatRooms?.map?.((currChatRoom: GroupSchemaType) => {
                    if (currChatRoom?._id === res?.payload?.updatedChatRoom?._id) {
                        return res?.payload?.updatedChatRoom;
                    } else {
                        return currChatRoom;
                    }
                })
            });
        }
    };

    const onCreateNewChatRoomHandler = (res: OnListenerResponseType) => {
        console.log('onCreateNewChatRoomHandler', res);
        if (res?.success && res?.payload?._id) {
            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return [...allChatRooms, res?.payload];
            });

            if (res?.emitter) {
                successToastMessage(`Chatroom created successfully!`);
            }
        } else {
            errorToastMessage(res?.errorMessage)
        }
    }
    // on listeners end...
    // Handlers end...

    // useEffect start...
    useEffect(() => {
        if (loggedInUser?._id) {
            socketConnection.emit('joinOwnRoom', loggedInUser?._id);
        }
    }, [loggedInUser]);

    useEffect(() => {
        // Emit events start...
        // Emit events start...

        // on listeners start...
        socketConnection.on(`addUsersInChatRoomBroadcast`, onAddUsersInChatRoomHandler);
        socketConnection.on(`removeUsersFromChatRoomBroadcast`, onRemoveUsersInChatRoomHandler);
        socketConnection.on(`addChatRoomBroadcast`, onCreateNewChatRoomHandler);
        socketConnection.on(`addChatRoomAck`, onCreateNewChatRoomHandler);

        return () => {
            socketConnection.off(`addUsersInChatRoomBroadcast`, onAddUsersInChatRoomHandler);
            socketConnection.off(`removeUsersFromChatRoomBroadcast`, onRemoveUsersInChatRoomHandler);
            socketConnection.off(`addChatRoomBroadcast`, onCreateNewChatRoomHandler);
            socketConnection.off(`addChatRoomAck`, onCreateNewChatRoomHandler);
        }
        // on listeners end...
    }, [loggedInUser?._id, chatRooms]);
    // useEffect start...

    return {
        createNewChatRoomHandler
    }
};

export default useChatsGeneralSocketEvents;