import React, { useState, useEffect, useContext, useMemo } from "react";

import { socketConnection } from "../../api/socketConnection";

import CreateNewGroup from "./CreateNewGroup";
import ChatRoom from "./ChatRoom";
import ChatWindow from "./ChatWindow";

import { ApiGet, ApiPost } from "../../api/ApiMethods";

import { userContext } from "../../globalState/userState";

import useJoinAllChatRooms from "../../customHooks/socketEvents/useJoinAllChatRooms";
import useChatsGeneralSocketEvents from "../../customHooks/socketEvents/useChatsGeneralSocketEvents";

import { FormSingleFieldType } from "../../types/forms/generalForm";
import { UserSchemaType } from "../../types/User/UserSchema";
import { UserContextSchemaType, UserContextType } from "../../types/globalState/userState";
import { GroupSchemaType } from "../../types/Group/GroupSchema.js";
import { AllGroupsAuthResponseType } from "../../types/api/groupTypes.js";
import { GetAllUsersResponseType } from "../../types/api/userTypes.js";
import { MapFormStatePayloadType } from "../../types/utils/formUtils";
import { OptionValueType } from "../../types/components/MultiSelectSearch";
import { OptionType } from "../../types/components/MultiSelectSearch";
import { AllChatMessagesType } from "../../types/Pages/Chats";
import { updateChatMessagesArgsActionType, updateChatMessagesArgsType } from "../../types/Pages/Chats";
import { ChatSchema } from "../../types/Chat/ChatSchema";

import './Chats.css';

const Chats: React.FC = (): JSX.Element => {

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    const setUserState: ((userData: UserContextSchemaType) => void) | undefined = userContextData?.setUserState;
    // Context API data end...

    // State variables start...
    const [allChatRooms, setAllChatRooms] = useState<Array<GroupSchemaType>>([]);
    const [currentTab, setCurrentTab] = useState<number>(0);
    const [currentChatRoom, setCurrentChatRoom] = useState<GroupSchemaType>({
        admin: '',
        isActive: true,
        name: '',
        users: [],
        _id: '',
        createdAt: '',
        updatedAt: ''
    });

    const [chatMessages, setChatMessages] = useState<AllChatMessagesType>({});
    // State variables end...

    // Handlers start...
    const updateChatMessagesHandler = (args: updateChatMessagesArgsType) => {
        if (args?.action === 'setMessages') {
            const roomId = args?.payload?.roomId;
            const chatMessagesPayload = args?.payload?.chatMessages;
            console.log('setMessage', roomId, args?.payload);
            if (roomId) {
                setChatMessages((chatMessages: AllChatMessagesType) => {
                    return {
                        ...chatMessages,
                        [roomId]: chatMessagesPayload || []
                    }
                });
            }
        } else if (args?.action === 'newMessage') {
            const roomId = args?.payload?.roomId;
            console.log('newMessage', chatMessages, args);
            if (roomId) {
                setChatMessages((chatMessages: AllChatMessagesType) => {
                    return {
                        ...chatMessages,
                        [roomId]: [...(chatMessages?.[roomId] || []), args?.payload]
                    }
                })
            }
            
        } else if (args?.action === 'editMessage') {
            const messageId = args?.payload?._id;
            const roomId = args?.payload?.roomId;

            if (roomId) {
                setChatMessages((chatMessages: AllChatMessagesType) => {
                    return {
                        ...chatMessages,
                        [roomId]: chatMessages?.[roomId]?.map((chatMessage: ChatSchema) => {
                            if (chatMessage?._id === messageId) {
                                return {
                                    ...args?.payload,
                                }
                            } else {
                                return chatMessage;
                            }
                        })
                    }
                });
            }
        } else if (args?.action === 'deleteMessage') {
            const messageId = args?.payload?.messageId;
            const roomId = args?.payload?.roomId;

            if (roomId) {
                setChatMessages((chatMessages: AllChatMessagesType) => {
                    return {
                        ...chatMessages,
                        [roomId]: chatMessages?.[roomId]?.filter((chatMessage: ChatSchema) => {
                            return (chatMessage?._id !== messageId);
                        })
                    }
                });
            }
        }
    }

    const getMessagesOnAddToChatRoomHandler = (chatMessages: Array<ChatSchema>) => {
        setChatMessages((currentChatMessages: AllChatMessagesType) => {
            if (currentChatMessages?.[chatMessages?.[0]?.roomId]) {
                return {
                    [chatMessages?.[0]?.roomId]: chatMessages
                }
            } else {
                return currentChatMessages;
            }
        })
    }
    // Handlers end...

    // Custom hooks start...
    useJoinAllChatRooms(allChatRooms);
    const { createNewChatRoomHandler } = useChatsGeneralSocketEvents(
        allChatRooms, 
        setAllChatRooms, 
        currentChatRoom?._id, 
        getMessagesOnAddToChatRoomHandler
    );
    // Custom hooks end...

    // useEffects start...
    useEffect(() => {
        if (loggedInUser?.token) {
            try {
                (async () => {
                    const res: AllGroupsAuthResponseType = await ApiGet(`group/user-is-member`);
                    
                    setAllChatRooms(res?.payload?.groups);
                    setCurrentChatRoom(res?.payload?.groups?.[0]);
                    console.log(res, 'response');
                })();
            } catch (err) {

            }
            
        }
    }, [loggedInUser?.token]);


    useEffect(() => {
        if (loggedInUser?._id) {
            socketConnection.emit('joinOwnRoom', loggedInUser?._id);
        }
    }, [loggedInUser?._id]);


    useEffect(() => {
        setCurrentChatRoom((currentChatRoom: GroupSchemaType) => {
            return allChatRooms?.filter((chatRoom: GroupSchemaType) => {
                return (currentChatRoom?._id === chatRoom?._id);
            })?.[0];
        });

    }, [allChatRooms]);
    // useEffects end...

    console.log(allChatRooms, currentChatRoom, chatMessages, 'Chatsjsx');

    return (
        <>
            <div
                className={`chats-root`}
            >
                <div
                    className={`chats-root-1`}
                >
                    <div
                        className={`chat-root-1-menu-container`}
                    >
                        Chat Rooms
                        <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                setCurrentTab((currentTab: number) => {
                                    if (currentTab === 0) return 1;
                                    else return 0;
                                });
                            }}
                        >
                            {currentTab === 0 ? `Create New Chatroom` : `Back to chat window`}
                        </button>
                    </div>
                    <div
                        className={`chats-root-1-2`}
                    >
                        {allChatRooms?.map((chatRoom: GroupSchemaType, chatRoomIdx: number) => {
                            return (
                                <React.Fragment key={chatRoom?._id}>
                                    <div
                                        className={`chats-root-1-2-chat-room-container 
                                            ${currentChatRoom?._id === chatRoom?._id ? `opened-chat-room` : ``}`}
                                        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                            setCurrentTab(0);
                                            setCurrentChatRoom(chatRoom);
                                        }}
                                    >
                                        <ChatRoom
                                            _id={chatRoom?._id}
                                            name={chatRoom?.name}
                                            users={chatRoom?.users}
                                            admin={chatRoom?.admin}
                                            isActive={chatRoom?.isActive}
                                            createdAt={chatRoom?.createdAt}
                                            updatedAt={chatRoom?.updatedAt}
                                            chatMessages={chatMessages?.[chatRoom._id]}
                                        />
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
                <div
                    className={`chats-root-2`}
                >
                    {currentTab === 0 && currentChatRoom?._id ? (
                        <ChatWindow
                            roomId={currentChatRoom?._id}
                            chatRoomMessages={chatMessages[currentChatRoom?._id] || []}
                            updateChatMessagesHandler={updateChatMessagesHandler}
                            chatRoom={currentChatRoom}
                            allChatRooms={allChatRooms}
                            setAllChatRooms={setAllChatRooms}
                            setCurrentChatRoom={setCurrentChatRoom}
                        /> 
                    ) : null}

                    {currentTab === 1 ? (
                        <CreateNewGroup
                            createNewChatRoomHandler={createNewChatRoomHandler}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default Chats;