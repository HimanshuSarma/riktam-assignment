import { useEffect, useContext } from 'react';

import { socketConnection } from '../../api/socketConnection';

import { userContext } from '../../globalState/userState';

import { GroupSchemaType } from '../../types/Group/GroupSchema';
import { UserContextSchemaType, UserContextType } from '../../types/globalState/userState';
import { UserSchemaType } from '../../types/User/UserSchema';

const useJoinAllChatRooms = (chatRooms: Array<GroupSchemaType>) => {

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    const setUserState: ((userData: UserContextSchemaType) => void) | undefined = userContextData?.setUserState;
    // Context API data end...

    // Handlers start...
    // Handlers end...

    useEffect(() => {
        // Emit events start...
        if (loggedInUser?.token && loggedInUser?._id) {
            const allChatRoomIds = chatRooms?.map((chatRoom: GroupSchemaType) => {
                return chatRoom?._id;
            });
            
            socketConnection.emit('joinChatRooms', allChatRoomIds, loggedInUser?._id, loggedInUser?.token);
        }
       
        // Emit events end...
    }, [loggedInUser?.token, loggedInUser?._id, chatRooms]);
}

export default useJoinAllChatRooms;