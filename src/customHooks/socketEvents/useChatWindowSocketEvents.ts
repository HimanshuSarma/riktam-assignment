import React, { useEffect, useContext } from "react";

import { socketConnection } from "../../api/socketConnection";

import { userContext } from "../../globalState/userState";

import { ChatSchema } from "../../types/Chat/ChatSchema";
import { UserSchemaType } from "../../types/User/UserSchema";
import { UserContextSchemaType, UserContextType } from "../../types/globalState/userState";
import { MapFormStatePayloadType } from "../../types/utils/formUtils";
import { GroupSchemaType } from "../../types/Group/GroupSchema";
import { ActionType } from "../../types/customHooks/socketEvents/socketEventTypes";
import { updateChatMessagesArgsType } from "../../types/Pages/Chats";
import { OnListenerResponseType } from "../../types/api/socketResponseTypes";

import { errorToastMessage, successToastMessage } from "../../utils/userNotifications/toastUtils";

const useChatWindowSocketEvents = (
    roomId: string, 
    updateChatMessagesHandler: (payload: updateChatMessagesArgsType) => void, 
    resetFormState: () => void,
    updateAddUsersFormState: (payload: GroupSchemaType, users: Array<string>) => void,
    updateRemoveUserFormState: (userId: Array<string>) => void,
    setAllChatRooms: React.Dispatch<React.SetStateAction<Array<GroupSchemaType>>>,
    chatRoom: GroupSchemaType
) => {

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined = userContextData?.user;
    // Context API data end...

    // Handlers start...
    // const joinChatRoom = (roomId: string) => {
    //     socketConnection.emit(`joinChatRoom`, roomId);
    // }

    const sendNewMessageHandler = (payload: MapFormStatePayloadType) => {
        if (!payload?.message) {
            return;
        }

        socketConnection.emit(`newMessage`, payload?.message, roomId, loggedInUser?.token);
    };

    const editMessageHandler = (payload: MapFormStatePayloadType, messageId: string) => {
        if (!payload?.message) {
            return;
        }

        socketConnection.emit(`editMessage`, payload?.message, messageId, roomId, loggedInUser?.token);
    };

    const deleteMessageHandler = (messageId: string) => {
        if (!messageId) {
            return;
        }

        socketConnection.emit(`deleteMessage`, messageId, roomId, loggedInUser?.token);
    };

    const likeOrUnlikeMessageHandler = (action: ActionType, messageId: string) => {
        if (!action) {
            return;
        }

        console.log('likeOrUnlikeMessage', roomId);

        socketConnection.emit(`likeOrUnlikeMessage`, messageId, action, roomId, loggedInUser?.token);
    };

    const addUsersInChatRoomHandler = (users: Array<string>) => {
        socketConnection.emit(`addUsersInChatRoom`, users, roomId, loggedInUser?.token);
    };

    const removeUserFromChatRoomHandler = (users: Array<string>,) => {
        console.log('removeUserFromChatRoomHandler', users, roomId)
        socketConnection.emit(`removeUsersFromChatRoom`, users, roomId, loggedInUser?.token);
    }

    // on listener handlers start...
    const onGetAllChatMessagesHandler = (res: OnListenerResponseType) => {
        console.log(res, 'payload');
        // setChatMessages(payload);
        if (res?.success && res?.payload) {
            // updateChatMessagesHandler({ action: 'setMessages', payload: { chatMessages: payload, roomId } });
            updateChatMessagesHandler({ action: 'setMessages', payload: { 
                chatMessages: res?.payload?.chatMessages, 
                roomId: res?.payload?.roomId 
            } });
        } else {
            errorToastMessage(res?.errorMessage);
        }
        
    };

    const onNewMessageHandler = (res: OnListenerResponseType) => {
        console.log(res, 'payloadChat');
        if (res?.success && res?.payload?._id) {
            // setChatMessages((chatMessages: Array<ChatSchema>) => {
            //     return [...chatMessages, payload];
            // });
            updateChatMessagesHandler({ action: 'newMessage', payload: res?.payload });
        }

        if (res?.emitter) {
            if (res?.success) {
                resetFormState();
            } else {
                errorToastMessage(res?.errorMessage);
            }
        }
    };

    const onEditMessageHandler = (res: OnListenerResponseType) => {
        if (res?.success && res?.payload?._id) {
            updateChatMessagesHandler({ action: 'editMessage', payload: res?.payload });
        }

        if (res?.emitter) {
            if (res?.success) {
                resetFormState();
            } else {
                errorToastMessage(res?.errorMessage);
            }
        }
    };

    const onLikeOrDislikeMessageHandler = (res: OnListenerResponseType) => {
        if (res?.success && res?.payload?._id) {
            console.log(res?.payload, 'likepayload');
            updateChatMessagesHandler({ action: 'editMessage', payload: res?.payload });
        }

        if (res?.emitter) {
            if (res?.success) {
                resetFormState();
            } else {
                errorToastMessage(res?.errorMessage);
            }
        }
    };

    const onDeleteMessageHandler = (res: OnListenerResponseType) => {
        if (res?.success && res?.payload?.messageId && res?.payload?.roomId) {
            updateChatMessagesHandler({ action: 'deleteMessage', payload: { 
                messageId: res?.payload?.messageId, 
                roomId: res?.payload?.roomId
            } });
        }

        if (res?.emitter) {
            if (res?.success) {
                // resetFormState();
            } else {
                errorToastMessage(res?.errorMessage);
            }
        }
    };

    const onAddUsersInChatRoomHandler = (res: OnListenerResponseType) => {
        console.log(res, 'addUsersInChatRoom');
        if (res?.success && res?.payload) {
            if (res?.emitter) {
                updateAddUsersFormState(res?.payload?.updatedChatRoom, res?.payload?.users);
            }

            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return allChatRooms?.map((currChatRoom: GroupSchemaType) => {
                    if (currChatRoom?._id === res?.payload?.updatedChatRoom?._id) {
                        return {
                            ...currChatRoom,
                            users: [...currChatRoom?.users, ...res?.payload?.users]
                        }
                    } else {
                        return currChatRoom;
                    }
                })
            });
            successToastMessage(`User(s) added to chat room`);
        } else {
            errorToastMessage(res?.errorMessage);
        }
    };

    const onRemoveUsersFromChatRooomHandler = (res: OnListenerResponseType) => {
        console.log(res, `removeUsersFromChatRoomAck`);
        if (res?.success && res?.payload) {
            if (res?.emitter) {
                updateRemoveUserFormState(res?.payload?.users);
            }

            setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
                return allChatRooms?.map((currChatRoom: GroupSchemaType) => {
                    if (currChatRoom?._id === res?.payload?.updatedChatRoom?._id) {
                        return {
                            ...currChatRoom,
                            // users: [...currChatRoom?.users, ...users]
                            users: currChatRoom?.users?.filter((user: string) => {
                                return !(res?.payload?.users?.includes(user));
                            })
                        }
                    } else {
                        return currChatRoom;
                    }
                })
            });
            successToastMessage(`User(s) removed from chat room`);
        } else {
            errorToastMessage(res?.errorMessage);
        }
    }
    // on listener handlers end...
    // Handlers end...

    useEffect(() => {
        console.log('emitted');

        // Emit events start...
        socketConnection.emit('getAllChatMessages', roomId, loggedInUser?.token);
        // Emit events end...

        // on listeners start...
        socketConnection.on(`getAllChatMessagesAck`, onGetAllChatMessagesHandler);
        socketConnection.on(`newMessageBroadcast`, onNewMessageHandler);
        socketConnection.on(`newMessageAck`, onNewMessageHandler);
        socketConnection.on(`addUsersInChatRoomAck`, onAddUsersInChatRoomHandler);
        socketConnection.on(`removeUsersFromChatRoomAck`, onRemoveUsersFromChatRooomHandler);
        socketConnection.on(`editMessageBroadcast`, onEditMessageHandler);
        socketConnection.on(`editMessageAck`, onEditMessageHandler);
        socketConnection.on(`likeOrUnlikeMessageBroadcast`, onLikeOrDislikeMessageHandler);
        socketConnection.on(`likeOrUnlikeMessageAck`, onLikeOrDislikeMessageHandler);
        socketConnection.on(`deleteMessageBroadcast`, onDeleteMessageHandler);
        socketConnection.on(`deleteMessageAck`, onDeleteMessageHandler);
        
        // on listeners end...

        return () => {
            socketConnection.off(`getAllChatMessagesAck`, onGetAllChatMessagesHandler);
            socketConnection.off(`newMessageBroadcast`, onNewMessageHandler);
            socketConnection.off(`newMessageAck`, onNewMessageHandler);
            socketConnection.off(`addUsersInChatRoomAck`, onAddUsersInChatRoomHandler);
            socketConnection.off(`removeUsersFromChatRoomAck`, onRemoveUsersFromChatRooomHandler);
            socketConnection.off(`editMessageBroadcast`, onEditMessageHandler);
            socketConnection.off(`editMessageAck`, onEditMessageHandler);
            socketConnection.off(`likeOrUnlikeMessageBroadcast`, onLikeOrDislikeMessageHandler);
            socketConnection.off(`likeOrUnlikeMessageAck`, onLikeOrDislikeMessageHandler);
            socketConnection.off(`deleteMessageBroadcast`, onDeleteMessageHandler);
            socketConnection.off(`deleteMessageAck`, onDeleteMessageHandler);
        }
    }, [roomId, loggedInUser]);

    return {
        sendNewMessageHandler,
        editMessageHandler,
        deleteMessageHandler,
        likeOrUnlikeMessageHandler,
        addUsersInChatRoomHandler,
        removeUserFromChatRoomHandler
        // joinChatRoom
    }
};

export default useChatWindowSocketEvents;