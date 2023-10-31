import React from 'react'
import ReactDOM from 'react-dom/client'
import Chat from './components/Chat.tsx'
import './globalStyles.css'
import { io } from 'socket.io-client';
// init socket
const socket = io(import.meta.env.VITE_HOST + ':' + import.meta.env.VITE_HOST_PORT)

// sends a new message to the server which then sends it to all clients
const sendMessage = (userID:number, message:string) => socket.emit('new message', userID, message)
const newUser = async (username: string, password: string) => {
  // Emit a 'new user' event with the username and password to the socket
  socket.emit('new user', username, password);

  // Wait for the 'new user id' event or 'new user error' event from the socket
  const newUserID = await new Promise<number>((resolve, reject) => {
    socket.on('new user id', (userID) => resolve(userID));
    socket.on('new user error', (err) => reject(err)); // errors are handled by using 'try catch' or 'then' on newUser function
  });

  // Return the new user ID
  return newUserID;
}
const authenticateUser = async (username:string, password:string) => {
  // Emit an 'auth' event with the username and password to the socket
  socket.emit('auth', username, password)
  
  // Wait for the 'auth response' event from the socket
  const auth = await new Promise((resolve, reject) => {
    socket.on('auth response', (userID:number) => userID == -1 ? reject() : resolve(userID))
  }) as number

  // Return the auth reponse which is -1 if the user failed authentication
  // or the userID if the user was authenticated successfuly.
  return auth
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chat
      socket={socket}
      sendMessage={sendMessage}
      newUser={newUser}  
      authenticateUser={authenticateUser}
    />
  </React.StrictMode>,
)
