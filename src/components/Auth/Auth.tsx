import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { userContext } from "../../globalState/userState";

import { UserContextType } from "../../globalState/userState";
import { UserContextSchemaType } from "../../types/globalState/userState";

interface AuthPropType {
    children: JSX.Element
};

const Auth: React.FC<AuthPropType> = ({ children }): JSX.Element => {

    const navigate = useNavigate();

    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;

    useEffect(() => {
        if (!loggedInUser?.token) {
            navigate(`/`);
        }
    }, [loggedInUser]);

    return (
        <>
            {loggedInUser?.token ? (
                <>
                    {children}
                </>
            ) : (
                null
            )}
        </>
    );
};

export default Auth;