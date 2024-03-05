import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation, NavigateFunction, Location } from 'react-router-dom';

import { userContext } from "../../globalState/userState";

import { logoutUser } from "../../utils/User/userUtils";

import { UserContextType } from "../../types/globalState/userState";
import { UserSchemaType } from "../../types/User/UserSchema";
import { UserContextSchemaType } from "../../types/globalState/userState";

import './Navbar.css';

const Navbar: React.FC = (): JSX.Element => {

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    const clearUserState: (() => void) | undefined = userContextData?.clearUserState;
    // Context API data end...

    // Navigation hooks start...
    const navigate: NavigateFunction = useNavigate();
    const location: Location = useLocation();
    // Navigation hooks end...

    // Handlers start...
    const logoutUserHandler = () => {
        logoutUser(clearUserState);
        navigate('/')
    }
    // Handlers end...

    return (
        <>
            <nav
                className={`navbar-root`}
            >
                <div>
                    <h1>Icon</h1>
                </div>

                <div
                    className={`navbar-root-nav-btn-container`}
                >
                    {!loggedInUser?.token ? (
                        <NavLink to="/signup"
                            className={`nav-btn`}
                        >
                            Signup
                        </NavLink>
                    ) : (
                        null
                    )} 
                    {!loggedInUser?.token ? (
                        <NavLink to="/login"
                            className={`nav-btn`}
                        >
                            Login
                        </NavLink>
                    ) : (
                        <button
                            onClick={logoutUserHandler}
                            className={`nav-btn`}
                        >
                            Logout
                        </button>
                    )} 

                    {loggedInUser?.token && location?.pathname !== `/chats` ? (
                        <NavLink 
                            to="/chats"
                            className={`nav-btn`}
                        >See your chats</NavLink>
                    ) : null}
                </div>
            </nav>
        </>
    );
};

export default Navbar;