import React, { useEffect, useState, useContext, FormEvent, ChangeEvent } from "react";

import { BsThreeDots } from "react-icons/bs";
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";

import PopupModal from "../../components/PopupModal/PopupModal";

import GeneralForm from "../../classes/GeneralForm";

import { socketConnection } from "../../api/socketConnection";
import { ApiGet } from "../../api/ApiMethods";

import { userContext } from "../../globalState/userState";

import useChatWindowSocketEvents from "../../customHooks/socketEvents/useChatWindowSocketEvents";

import { ChatWindowPropType } from "../../types/Pages/Chats";
import { ChatSchema } from "../../types/Chat/ChatSchema";
import { UserSchemaType } from "../../types/User/UserSchema";
import { FormSingleFieldType } from "../../types/forms/generalForm";
import { MapFormStatePayloadType } from "../../types/utils/formUtils";
import { GetAllUsersResponseType } from "../../types/api/userTypes";
import { OptionValueType, OptionType } from "../../types/components/MultiSelectSearch";
import { GroupSchemaType } from "../../types/Group/GroupSchema";
import { GetAllUsersInGivenChatRoomResponseType } from "../../types/api/userTypes";
import { UserInChatRoom } from "../../types/Pages/Chats";


import { isFormValidated, mapFormStateToPayload } from "../../utils/formUtils";
import { getFormattedDateFromUnixTimestamp } from "../../utils/dates/getFormattedDate";

const ChatWindow: React.FC<ChatWindowPropType> = ({
    roomId,
    chatRoomMessages,
    updateChatMessagesHandler,
    allChatRooms,
    setAllChatRooms,
    chatRoom,
    setCurrentChatRoom,
}): JSX.Element => {

    // Static data start...
    const initFormFields: Array<FormSingleFieldType> = [
        {
            name: 'message',
            type: 'text',
            placeholder: 'Type your message here...',
            value: '',
            isTouched: false,
            errorMessage: `Message cannot be empty`,
            mapToPayload: true,
            onChangeHandler: function (value: string) {
                return value;
            },
            isFieldValidated: function (this: GeneralForm, value: string) {
                return (value.length >= 0);
            },
            component: ({ type, value, placeholder, isTouched, isValid, errorMessage, onChangeHandler }): JSX.Element => {
                console.log(value, isValid, 'name');
                return (
                    <>
                        <div
                            className={`signup-form-input-container`}
                        >
                            <input
                                type={type}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    onChangeHandler(e.target.value)
                                }}
                                placeholder={placeholder}
                            />

                            {isTouched && !isValid ? (
                                <p>
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>
                    </>
                )
            }
        }
    ];
    // Static data end...

    // Context API data start...
    const userContextData = useContext(userContext);
    const loggedInUser: UserSchemaType | null | undefined = userContextData?.user;
    // Context API data end...

    // State variables start...
    // const [chatRoomMessages, setChatMessages] = useState<Array<ChatSchema>>([]);

    const [showMessageMenu, setShowMessageMenu] = useState<{
        shouldShow: boolean,
        messageId: string
    }>({
        shouldShow: false,
        messageId: ''
    });

    // Chat room state variables start...
    const [allUsersInChatRoom, setAllUsersInChatRoom] = useState<Array<UserInChatRoom>>([]);
    const [viewUsersSearchQuery, setViewUsersSearchQuery] = useState<string>('');
    // Chat room state variables end...

    const [allUsers, setAllUsers] = useState<Array<UserSchemaType>>([]); // All users in the db...

    // Add users to group Multiselect Search state variables...
    const [allChatRoomCouldBeAddedUsers, setAllChatRoomCouldBeAddedUsers] = useState<Array<OptionValueType>>([]);
    const [toBeAddedUsersInGroupChat, setToBeAddedUsersInGroupChat] = useState<Array<OptionValueType>>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    // Add users to group Multiselect Search state variables...

    // Remove users from group Multiselect Search state variables...
    const [allChatRoomCouldBeRemovedUsers, setAllChatRoomCouldBeRemovedUsers] = useState<Array<OptionValueType>>([]);
    const [toBeRemovedUsersInGroupChat, setToBeRemovedUsersInGroupChat] = useState<Array<OptionValueType>>([]);
    const [searchRemoveUsersQuery, setSearchRemoveUsersQuery] = useState<string>("");
    // Remove users from group Multiselect Search state variables...

    const [latestAction, setLatestAction] = useState<'added' | 'deleted' | ''>('');

    // PopupModals state variables start...
    const [popModals, setPopupModals] = useState<{
        'addUsersPopupModal': boolean,
        'removeUsersPopupModal': boolean,
        'viewUsersPopupModal': boolean
    }>({
        'addUsersPopupModal': false,
        'removeUsersPopupModal': false,
        'viewUsersPopupModal': false
    });
    // PopupModals state variables end...

    // Form state variables start...
    const [formState, setFormState] = useState<GeneralForm>(new GeneralForm(initFormFields));

    const [editingMessage, setEditingMessage] = useState<ChatSchema | null>(null);
    // Form state variables end...
    // State variables end...

    // Handlers start...
    // Setup form handlers start...
    const setupMessageActionHandler = (chatMessage: ChatSchema) => {
        const updatedFormState: GeneralForm = {
            ...formState.onChangeHandler(`message`, chatMessage?.message)
        };

        setFormState(updatedFormState);
        setEditingMessage(chatMessage);
    };
    // Setup form handlers end...

    const updateAddUsersFormState = (payload: GroupSchemaType, users: Array<string>) => {
        setAllChatRoomCouldBeAddedUsers(allChatRoomCouldBeAddedUsers => {
            return allChatRoomCouldBeAddedUsers?.filter((user) => {
                return !(users?.includes(user?._id));
            })
        });

        setToBeAddedUsersInGroupChat([]);

        setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
            return allChatRooms?.map((currChatRoom: GroupSchemaType) => {
                if (currChatRoom?._id === chatRoom?._id) {
                    return {
                        ...currChatRoom,
                        users: [...currChatRoom?.users, ...users]
                    }
                } else {
                    return currChatRoom;
                }
            })
        });

        setLatestAction('added');
    }

    const updateRemoveUser = (users: Array<string>) => {

        setAllChatRoomCouldBeRemovedUsers(allChatRoomCouldBeRemovedUsers => {
            return allChatRoomCouldBeRemovedUsers?.filter((user) => {
                return !(users?.includes(user?._id));
            })
        });

        setToBeRemovedUsersInGroupChat([]);


        setAllChatRooms((allChatRooms: Array<GroupSchemaType>) => {
            return allChatRooms?.map((currChatRoom: GroupSchemaType) => {
                if (currChatRoom?._id === chatRoom?._id) {
                    return {
                        ...currChatRoom,
                        // users: [...currChatRoom?.users, ...users]
                        users: currChatRoom?.users?.filter((user: string) => {
                            return !(users?.includes(user));
                        })
                    }
                } else {
                    return currChatRoom;
                }
            })
        });

        setLatestAction('deleted');
    }

    const updateCouldBeAddedUsersStateHandler = () => {
        // const updatedUnselectedOptions: OptionType = {};
        const updatedCouldBeAddedUsersOptions: Array<OptionValueType> = [];

        const couldBeAddedUsers = allUsers?.filter((user: UserSchemaType) => {
            return !(chatRoom?.users?.includes?.(user?._id)) && user?._id !== chatRoom?.admin;
        })

        for (let i = 0; i < couldBeAddedUsers?.length; i++) {
            updatedCouldBeAddedUsersOptions.push({
                _id: couldBeAddedUsers?.[i]?._id,
                value: couldBeAddedUsers?.[i]?._id,
                label: couldBeAddedUsers?.[i]?.name
            });
        }

        console.log(chatRoom, 'updatedHere');

            
        setAllChatRoomCouldBeAddedUsers(updatedCouldBeAddedUsersOptions);
        setToBeAddedUsersInGroupChat([]);

        // setSearchFilteredOptions([]);
    }

    const updateCouldBeRemovedUsersStateHandler = () => {
        // const updatedUnselectedRemoveUsersOptions: OptionType = {};
        const updatedCouldBeRemoveUsersOptions: Array<OptionValueType> = [];

        console.log(chatRoom?.users);

        for (let i = 0; i < chatRoom?.users?.length; i++) {
            if (chatRoom.users?.[i] !== chatRoom?.admin) {
                const userObj = allUsersInChatRoom?.
                filter((user: UserInChatRoom) => {
                    return (chatRoom?.users?.[i] === user?._id && user?._id !== chatRoom?.admin);
                })?.[0];

                updatedCouldBeRemoveUsersOptions.push({
                    _id: userObj?._id,
                    value: userObj?._id,
                    label: userObj?.name
                });
            }
        }

        setAllChatRoomCouldBeRemovedUsers(updatedCouldBeRemoveUsersOptions);
        setToBeRemovedUsersInGroupChat([]);

        // setSearchFilteredRemoveUsersOptions([]);
    }

    const resetMultiSelectSearchStateHandler = () => {
        // setSelectedOptions({});
        // setShowDropdownList(false);
        // setSearchQuery('');
        // setSearchFilteredOptions([]);
        // setFocusedOptionIdx(-1);

        // const unselectedOptions: OptionType = {};
        // for (let i = 0; i < allChatRoomCouldBeAddedUsers.length; i++) {
        //     unselectedOptions[allChatRoomCouldBeAddedUsers[i]._id] = allChatRoomCouldBeAddedUsers[i];
        // }

        // setUnselectedOptions(unselectedOptions);
    }

    let resetFormState = () => {
        setFormState(new GeneralForm(initFormFields));
    }

    const messageMenuActionHandler = () => {
        setShowMessageMenu((showMessageMenu) => {
            return {
                ...showMessageMenu,
                shouldShow: false,
            }
        });
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e?.stopPropagation();
        e?.preventDefault();

        try {
            const isFormValid: boolean = isFormValidated(formState);

            if (!isFormValid) {
                alert(`Please check all the form inputs!`);
                return;
            }

            const payload: MapFormStatePayloadType = mapFormStateToPayload(formState);

            console.log(payload, editingMessage, 'sendNewMessage');

            if (!editingMessage?._id) {
                sendNewMessageHandler({
                    ...payload,
                });
            } else {
                editMessageHandler({
                    ...payload,
                }, editingMessage?._id);

                setEditingMessage(null);
            }

        } catch (err) {
            console.log(err, 'sendNewMessageError');
        }
    }
    // Handlers end...

    // Custom hooks call start...
    const {
        sendNewMessageHandler,
        editMessageHandler,
        likeOrUnlikeMessageHandler,
        deleteMessageHandler,
        addUsersInChatRoomHandler,
        removeUserFromChatRoomHandler
    } = useChatWindowSocketEvents(
        roomId,
        updateChatMessagesHandler,
        resetFormState,
        updateAddUsersFormState,
        updateRemoveUser,
    );
    // Custom hooks call end...

    const onSubmitAddOrRemoveUsersToGroup = (e: React.FormEvent<HTMLFormElement>, action: 'addUsers' | 'removeUsers') => {

        e?.stopPropagation();
        e?.preventDefault();

        try {
            if (action === 'addUsers') {
                const usersToBeAddedInChatRoom: Array<string> = toBeAddedUsersInGroupChat?.map((user: OptionValueType, userIdx: number) => {
                    return user?._id
                });
    
                console.log(usersToBeAddedInChatRoom, 'toBeAdded');

                if (usersToBeAddedInChatRoom?.length > 0) {
                    addUsersInChatRoomHandler(usersToBeAddedInChatRoom);
                }
            } else {
                const usersToBeRemovedFromChatRoom: Array<string> = toBeRemovedUsersInGroupChat?.map((user: OptionValueType, userIdx: number) => {
                    return user?._id
                });
    
                console.log('removed', usersToBeRemovedFromChatRoom);
                if (usersToBeRemovedFromChatRoom?.length > 0) {
                    removeUserFromChatRoomHandler(usersToBeRemovedFromChatRoom);
                }
            }
            
        } catch (err) {

        }
    }

    // useEffect start...
    // useEffect(() => {
    //     console.log(socketConnection, 'socketConnection');
    //     joinChatRoom(roomId);
    // }, [roomId]);

    useEffect(() => {
        (async () => {
            try {
                if (loggedInUser?._id) {
                    const res: GetAllUsersResponseType = await ApiGet(`user/all`);
                    // console.log(res?.payload?.users?.filter?.((user: UserSchemaType) => {
                    //     if (user?._id !== loggedInUser?._id) {
                    //         return true;
                    //     } else {
                    //         return false;
                    //     }
                    // }), 'loggedInUser');
                    setAllUsers(() => {
                        return res?.payload?.users
                    });

                    const allUsersInChatRoom: Array<string> = [...chatRoom?.users, chatRoom?.admin, loggedInUser?._id];
                    setAllChatRoomCouldBeAddedUsers(
                        res?.payload?.users?.
                        filter?.((user: UserSchemaType) => {
                            if (!allUsersInChatRoom?.includes(user?._id)) {
                                return true;
                            } else {
                                return false;
                            }
                        })?.
                        map?.((user: UserSchemaType): OptionValueType => {
                            return {
                                _id: user?._id,
                                value: user?._id,
                                label: user?.name
                            }
                        })
                    );

                    setAllUsersInChatRoom((users: Array<UserInChatRoom>) => {
                        return res?.payload?.users?.
                            filter((currUser: UserSchemaType) => {
                                return (allUsersInChatRoom?.includes(currUser?._id));
                            })?.
                            map((currUser: UserSchemaType) => {
                                const user: UserInChatRoom = {
                                    ...currUser,
                                    userType: chatRoom?.admin === currUser?._id ? 'Admin' : 'Normal'
                                }
                                return user;
                            });
                    });
                }

            } catch (err) {
                console.log(err, 'getAllUsersError');
            }
        })();

        return () => {
            resetMultiSelectSearchStateHandler();
        }
    }, [loggedInUser, chatRoom]);


    useEffect(() => {

        if (latestAction === 'added') {
            updateCouldBeRemovedUsersStateHandler();
        } else if (latestAction === 'deleted') {
            updateCouldBeAddedUsersStateHandler();
        } else {
            console.log('both');
            updateCouldBeRemovedUsersStateHandler();
            updateCouldBeAddedUsersStateHandler();
        }
    }, [popModals?.viewUsersPopupModal, allUsersInChatRoom, chatRoom, latestAction]);


    useEffect(() => {
        
    }, [allChatRoomCouldBeAddedUsers]);
    // useEffect end...

    console.log(toBeAddedUsersInGroupChat, chatRoom, 'chatRoomMessages');

    return (
        <>
            <div
                className={`chat-window-root`}
            >
                <div
                    className={`chat-window-root-header-container`}
                >
                    Chat Window
                    <div
                        className={`chat-window-menu-container`}
                    >
                        {chatRoom?.admin === loggedInUser?._id ? (
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    setPopupModals((popModals) => {
                                        return {
                                            ...popModals,
                                            addUsersPopupModal: !popModals?.addUsersPopupModal
                                        }
                                    });
                                }}
                            >
                                Add User(s)
                            </button>
                        ) : null}

                        {chatRoom?.admin === loggedInUser?._id ? (
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    setPopupModals((popModals) => {
                                        return {
                                            ...popModals,
                                            removeUsersPopupModal: !popModals?.removeUsersPopupModal
                                        }
                                    });
                                }}
                            >
                                Remove User(s)
                            </button>
                        ) : null} 

                        <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                setPopupModals((popModals) => {
                                    return {
                                        ...popModals,
                                        viewUsersPopupModal: !popModals?.viewUsersPopupModal
                                    }
                                });
                            }}
                        >
                            View User(s)
                        </button>
                    </div>
                </div>
                <div
                    className={`chat-window-root-chat-window-container`}
                >
                    <div
                        className={`chat-window-root-chat-messages-container`}
                    >
                        {chatRoomMessages?.length === 0 ? (
                            <div>
                                Chatroom is empty
                            </div>
                        ) : (
                            chatRoomMessages?.map((chatMessage: ChatSchema, chatMessageIdx: number) => {
                                return (
                                    <React.Fragment key={chatMessage?._id}>
                                        <div
                                            className={`${loggedInUser?._id === chatMessage?.createdBy ? `align-right` : `align-left`} chat-message-container`}
                                        >
                                            {showMessageMenu?.shouldShow && chatMessage?._id === showMessageMenu?.messageId ? (
                                                <div
                                                    className={`${loggedInUser?._id === chatMessage?.createdBy ? `right-0` : `left-0`} chat-message-menu-container`}
                                                >
                                                    {/* {chatRoom?.admin === loggedInUser?._id &&
                                                        chatMessage?.createdBy !== chatRoom?.admin &&
                                                        chatRoom?.users?.includes(chatMessage?.createdBy) ? (
                                                        <button
                                                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                                removeUserFromChatRoomHandler(
                                                                    chatMessage?.createdBy,
                                                                    chatRoom?._id
                                                                );
                                                            }}
                                                        >
                                                            Remove User
                                                        </button>
                                                    ) : null} */}
    
                                                    {chatMessage?.createdBy === loggedInUser?._id ? (
                                                        <FaEdit
                                                            color="white"
                                                            size={`20`}
                                                            onClick={() => {
                                                                setupMessageActionHandler(chatMessage);
                                                                messageMenuActionHandler();
                                                            }}
                                                        >
                                                            Edit Message
                                                        </FaEdit>
                                                    ) : null}
    
                                                    {chatMessage?.createdBy === loggedInUser?._id ? (
                                                        <MdDelete
                                                            color="white"
                                                            size={`20`}
                                                            onClick={() => {
                                                                deleteMessageHandler(chatMessage?._id);
                                                                messageMenuActionHandler();
                                                            }}
                                                        >
                                                            Delete Message
                                                        </MdDelete>
                                                    ) : null}
    
                                                    {loggedInUser?._id ? (
                                                        chatMessage?.likes?.includes(loggedInUser?._id) ? (
                                                            <AiFillLike 
                                                                color="white"
                                                                size={`20`}
                                                                onClick={() => {
                                                                    likeOrUnlikeMessageHandler('removelike', chatMessage?._id);
                                                                    messageMenuActionHandler();
                                                                }}
                                                            />
                                                        ) : (
                                                            <AiOutlineLike
                                                                color="white"
                                                                size={`20`}
                                                                onClick={() => {
                                                                    likeOrUnlikeMessageHandler('like', chatMessage?._id);
                                                                    messageMenuActionHandler();
                                                                }}
                                                            />
                                                        )
                                                    ) : null}
    
                                                    {loggedInUser?._id ? (
                                                        chatMessage?.unlikes?.includes(loggedInUser?._id) ? (
                                                            <AiFillDislike 
                                                                color="white"
                                                                size={`20`}
                                                                onClick={() => {
                                                                    likeOrUnlikeMessageHandler('removeunlike', chatMessage?._id);
                                                                    messageMenuActionHandler();
                                                                }}
                                                            />
                                                        ) : (
                                                            <AiOutlineDislike 
                                                                color="white"
                                                                size={`20`}
                                                                onClick={() => {
                                                                    likeOrUnlikeMessageHandler('unlike', chatMessage?._id);
                                                                    messageMenuActionHandler();
                                                                }}
                                                            />
                                                        )
                                                    ) : null}
                                                </div>
                                            ) : null}
    
                                            <div
                                                className={`chat-message-container-1`}
                                            >
                                                <BsThreeDots
                                                    onClick={(e: React.MouseEvent<SVGAElement, MouseEvent>) => {
                                                        setShowMessageMenu((showMessageMenu) => {
                                                            if (chatMessage?._id !== showMessageMenu?.messageId) {
                                                                return {
                                                                    shouldShow: true,
                                                                    messageId: chatMessage?._id
                                                                };
                                                            } else {
                                                                return {
                                                                    shouldShow: !showMessageMenu?.shouldShow,
                                                                    messageId: chatMessage?._id
                                                                };
                                                            }
                                                        });
                                                    }}
                                                    className={`${chatMessage?.createdBy === loggedInUser?._id ? `align-right` : `align-left`} cp`}
                                                />
                                                <p>{chatMessage?.message}</p>
                                                <div
                                                    className={`message-container-1-likes-container`}
                                                >
                                                    <span>{`${chatMessage?.likes ? chatMessage?.likes?.length : 0}`} like(s)</span>
                                                    <span>{`${chatMessage?.unlikes ? chatMessage?.unlikes?.length : 0}`} dislike(s)</span>
                                                </div>
    
                                                <p>{getFormattedDateFromUnixTimestamp(chatMessage?.createdAt)}</p>
                                                {chatMessage?.isEdited ? <span>Edited</span> : null}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                        
                    </div>
                    
                    <div
                        className={`chat-messages-container-form-container`}
                    >
                        <form
                            className={`form-container form-normal-width`}
                            onSubmit={onSubmit}
                        >
                            {formState?.formFields?.map((formField: FormSingleFieldType, formFieldIdx: number) => {
                                return (
                                    <React.Fragment key={formField?.name}>
                                        <formField.component
                                            name={formField.name}
                                            type={formField.type}
                                            value={formField.value}
                                            isTouched={formField.isTouched}
                                            errorMessage={formField.errorMessage}
                                            onChangeHandler={(value: string) => {
                                                const updatedFormState: GeneralForm = {
                                                    ...formState.onChangeHandler(formField.name, value)
                                                };

                                                setFormState(updatedFormState);
                                            }}
                                            isValid={formState.isFieldValidated(formField.name)}
                                            placeholder={formField.placeholder}
                                        />
                                    </React.Fragment>
                                );
                            })}

                            <button>Send</button>
                        </form>
                    </div>
                </div>

                {popModals?.addUsersPopupModal ? (
                    <PopupModal
                        onClickHandler={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                            // setShowPopupModal(false);
                            setPopupModals(() => {
                                return {
                                    addUsersPopupModal: false,
                                    removeUsersPopupModal: false,
                                    viewUsersPopupModal: false,
                                }
                            })
                        }}
                    >   
                        <div
                            className={`popup-modal-content-container`}
                        >
                            {allChatRoomCouldBeAddedUsers?.length > 0 ? (
                                <form
                                    // className={`popup-modal-content-container`}
                                    className={`popup-modal-form-container`}
                                    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                        onSubmitAddOrRemoveUsersToGroup(e, 'addUsers');
                                    }}
                                >
                                    {allChatRoomCouldBeAddedUsers?.map((couldBeAddedUser: OptionValueType): JSX.Element => {
                                        return (
                                            <React.Fragment key={couldBeAddedUser?._id}>
                                                <div
                                                    onClick={() => {
                                                        // setToBeAddedUsersInGroupChat((toBeAddedUsersInGroupChat: Array<OptionValueType>) => {
                                                        //     return [...toBeAddedUsersInGroupChat, couldBeAddedUser];
                                                        // }); 

                                                        setToBeAddedUsersInGroupChat((toBeAddedUsersInGroupChat: Array<OptionValueType>) => {
                                                            const isUserAlreadySelected = toBeAddedUsersInGroupChat?.filter((toBeAddedUser: OptionValueType) => {
                                                                return (toBeAddedUser?._id === couldBeAddedUser?._id);
                                                            })?.[0];

                                                            if (isUserAlreadySelected?._id) {
                                                                return toBeAddedUsersInGroupChat?.filter((toBeAddedUser: OptionValueType) => {
                                                                    return (toBeAddedUser?._id !== couldBeAddedUser?._id);
                                                                });
                                                            } else {
                                                                return [...toBeAddedUsersInGroupChat, couldBeAddedUser];
                                                            }
                                                        }); 
                                                    }}

                                                    className={`add-user-form-item`}
                                                >
                                                    <p>{couldBeAddedUser?.label}</p>
                                                    <p>{toBeAddedUsersInGroupChat?.filter((toBeAddedUser: OptionValueType) => {
                                                        return (toBeAddedUser?._id === couldBeAddedUser?._id);
                                                    })?.[0]?._id ? `Selected` : `Not Selected`}</p>
                                                </div>
                                            </React.Fragment>
                                        )
                                    })}

                                    <button>
                                        Add user(s)
                                    </button>
                                </form>
                            ) : (
                                <p>No user(s) to add</p>
                            )} 
                        </div>
                    </PopupModal>) : null
                }

                {popModals?.removeUsersPopupModal ? (
                    <PopupModal
                        onClickHandler={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                            // setShowPopupModal(false);
                            setPopupModals(() => {
                                return {
                                    addUsersPopupModal: false,
                                    viewUsersPopupModal: false,
                                    removeUsersPopupModal: false
                                }
                            })
                        }}
                    >
                        <div
                            className={`popup-modal-content-container`}
                        >
                            {allChatRoomCouldBeRemovedUsers?.length > 0 ? (
                                <form
                                    className={`popup-modal-form-container`}
                                    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                        onSubmitAddOrRemoveUsersToGroup(e, 'removeUsers');
                                    }}
                                >
                                    {allChatRoomCouldBeRemovedUsers?.map((couldBeRemovedUser: OptionValueType): JSX.Element => {
                                        return (
                                            <React.Fragment key={couldBeRemovedUser?._id}>
                                                <div
                                                    onClick={() => {
                                                        setToBeRemovedUsersInGroupChat((toBeRemovedUsersInGroupChat: Array<OptionValueType>) => {
                                                            const isUserAlreadySelected = toBeRemovedUsersInGroupChat?.filter((toBeRemovedUser: OptionValueType) => {
                                                                return (toBeRemovedUser?._id === couldBeRemovedUser?._id);
                                                            })?.[0];

                                                            if (isUserAlreadySelected?._id) {
                                                                return toBeRemovedUsersInGroupChat?.filter((toBeRemovedUser: OptionValueType) => {
                                                                    return (toBeRemovedUser?._id !== couldBeRemovedUser?._id);
                                                                });
                                                            } else {
                                                                return [...toBeRemovedUsersInGroupChat, couldBeRemovedUser];
                                                            }
                                                        }); 
                                                    }}

                                                    className={`remove-user-form-item`}
                                                >
                                                    <p>{couldBeRemovedUser?.label}</p>
                                                    <p>{toBeRemovedUsersInGroupChat?.filter((toBeRemovedUser: OptionValueType) => {
                                                        return (toBeRemovedUser?._id === couldBeRemovedUser?._id);
                                                    })?.[0]?._id ? `Selected` : `Not Selected`}</p>
                                                </div>
                                            </React.Fragment>
                                        )
                                    })}

                                    <button>
                                        Remove user(s)
                                    </button>
                                </form>
                            ) : (
                                <p>No user(s) to remove</p>
                            )}
                        </div>
                    </PopupModal>) : null
                }

                {popModals?.viewUsersPopupModal && allUsersInChatRoom?.length > 0 ? (
                    <PopupModal
                        onClickHandler={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                            // setShowPopupModal(false);
                            setPopupModals(() => {
                                return {
                                    addUsersPopupModal: false,
                                    removeUsersPopupModal: false,
                                    viewUsersPopupModal: false
                                }
                            })
                        }}
                    >
                        <div
                            className={`popup-modal-content-container`}
                        >
                            <div>
                                <input 
                                    placeholder={`Search users here...`}
                                    value={viewUsersSearchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = e?.target?.value;

                                        setViewUsersSearchQuery(value);
                                    }}
                                />
                            </div>
                            {[...allUsersInChatRoom, ]
                                ?.filter((userInChatRoom: UserInChatRoom) => {
                                    return (userInChatRoom?.name?.includes?.(viewUsersSearchQuery));
                                })
                                ?.map((userInChatRoom: UserInChatRoom) => {
                                return (
                                    <React.Fragment key={userInChatRoom?._id}>
                                        <div
                                            className={`view-user-container`}
                                        >
                                            <p>{userInChatRoom?.name}</p>
                                            {userInChatRoom?.userType === 'Admin' ? (
                                                <p>Admin</p>
                                            ) : null}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </PopupModal>
                ) : null}
            </div>
        </>
    );
};

export default ChatWindow;