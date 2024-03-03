import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from "./Pages/Home/Home";
import Signup from './Pages/Signup/Signup';
import Login from './Pages/Login/Login';
import Chats from './Pages/Chats/Chats';

import Navbar from "./components/Navbar/Navbar";

import { socketConnection } from './api/socketConnection';

import UserContextProvider from './globalState/userState';

import { UserSchemaType } from './types/User/UserSchema';

import "./styles.css";

export default function App() {

  return (
    <UserContextProvider>
      <div className="App">
        <ToastContainer 
          position={'top-right'}
          autoClose={5000}
        />
        <h1>Riktam Assignment</h1>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/chats' element={<Chats />} />
        </Routes>
      </div>
    </UserContextProvider>
  );
}
