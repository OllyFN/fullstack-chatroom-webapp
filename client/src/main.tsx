import React from 'react'
import ReactDOM from 'react-dom/client'
import Chat from './components/Chat.tsx'
import './globalStyles.css'
import { io } from 'socket.io-client';
import { messageType } from '../types.ts';

const socket = io(import.meta.env.VITE_HOST + ':' + import.meta.env.VITE_HOST_PORT)
const sendMessage = (userID:number, message:string) => socket.emit('new message', userID, message)
const newUser = async (username:string, password:string) => {
  socket.emit('new user', username, password)
  const newUserID = await new Promise((res, rej) => {
    socket.on('new user id', (userID) => res(userID))
    socket.on('new user error', (err) => rej(err))
  }) as number

  return newUserID
}
// initial message load
const maxMessageLoadTimeout = 5000;

// This function checks if the messages are loaded
// and if not, it doubles the message load timeout until it reaches max
// and calls a timeout to try and load the messages again
const messageRepeatLoad = async (messageLoadTimeout:number):Promise<messageType[]> =>
  new Promise<messageType[]>((res, rej) => 
    fetch(`http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_HOST_PORT}/messages`) // fetch messages
        .then(res => res.json(), rej) // on success, parse json, else reject
        .then(data => res(data), rej) // on success, update messages & resolve, else reject
  ).then(data => data, () =>
      new Promise(
      res => setTimeout(() => messageRepeatLoad(Math.min(messageLoadTimeout*2, maxMessageLoadTimeout)).then((result:messageType[]) => res(result)), messageLoadTimeout))
  )

const authenticateUser = async (username:string, password:string) => {
  socket.emit('auth', username, password)
  
  const auth = await new Promise((res) => {
    socket.on('auth response', (userID:number) => res(userID))
  }) as number

  return auth
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chat
      socket={socket}
      sendMessage={sendMessage}
      newUser={newUser}  
      authenticateUser={authenticateUser}
      messageRepeatLoad={messageRepeatLoad}
    />
  </React.StrictMode>,
)
