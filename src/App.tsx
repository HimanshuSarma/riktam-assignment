import { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Auth from './components/Auth/Auth';
import NoAuth from './components/Auth/NoAuth';
import Home from "./Pages/Home/Home";
import Signup from './Pages/Signup/Signup';
import Login from './Pages/Login/Login';
import Chats from './Pages/Chats/Chats';

import Navbar from "./components/Navbar/Navbar";

import { socketConnection } from './api/socketConnection';

import { UserContextType } from './globalState/userState';
import { userContext } from './globalState/userState';

import { UserSchemaType } from './types/User/UserSchema';
import { UserContextSchemaType } from './types/globalState/userState';

import "./styles.css";

export default function App() {

  const userContextData: UserContextType | null = useContext(userContext);
  const loggedInUser: UserContextSchemaType | null | undefined = userContextData?.user;
  const isUserDataSet: boolean | undefined = userContextData?.isUserDataSet;

  return (
    <div className="App">
      <ToastContainer 
        position={'top-right'}
        autoClose={5000}
      />
      <h1>Chat application</h1>
      <Navbar />
      {isUserDataSet ? <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/signup' element={
            <NoAuth>
              <Signup />
            </NoAuth>
          } />
          <Route path='/login' element={
            <NoAuth>
              <Login />
            </NoAuth>} />
          <Route path='/chats' element={
            <Auth>
              <Chats />
            </Auth>
          } />
      </Routes> : null}
    </div>
  );
}
