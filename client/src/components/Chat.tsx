import Message from './Message.tsx'
import './styles/ChatStyles.css'
import { chatProps, messageType } from '../../types.ts'
import Input from './Input.tsx'
import { useEffect, useState } from 'react'
import Login from './Login.tsx'
import validateUserInput from '../scripts/validateUserInput.ts'
import messageRepeatLoad from '../scripts/messageRepeatLoad.ts'

export default function Chat({sendMessage, newUser, authenticateUser, socket}:chatProps) {
  // I do want to eventually switch these useStates for reducers but for now they are fine.
  const [userInput, setUserInput] = useState('')
  const [userID, setUserID] = useState(0)
  const [username, setUsername] = useState('')
  const [userError, setError] = useState<string>('')
  const [waitingForResponse, setWaitState] = useState<boolean>(false)
  const [messages, setMessages] = useState<messageType[]>([])

  // This function adds a new message to the local state at the beginning of the array
  const addNewMessage = (name:string, message:string) => 
        setMessages(curMessages => [{name:name, message:message}, ...curMessages])

  useEffect(() => {
    // Only on mount, we load the messages
    messageRepeatLoad(500).then((c:messageType[]) => setMessages(c))
  }, [])

  // When a new message is received, we add it to the local state
  socket.on('message', (sender:string, message:string) => addNewMessage(sender,message))
  
  const handleNewMessage = (message:string) => {
    sendMessage(userID, message) // Send the message to the server
    addNewMessage(username, message) // Add the message to the local state
    setUserInput('') // Reset user input
  }
  
  const handleUserLogin = (username: string, password: string, isRegistering = false) => {
    // Check if the user input is valid or if we are already waiting for a response
    const userError = validateUserInput(username, password) // returns empty string if no errors else returns error message
    if (userError != '' || waitingForResponse) {
      setError(userError)
      return;
    }
  
    // Set the waiting state to true because after this function runs, we are waiting for a response from the server.
    setWaitState(true);
  
    if (isRegistering) {
      // Register a new user
      newUser(username, password)
        .then((newUserID) => {
          // Set the new user ID and username
          setUserID(newUserID);
          setUsername(username);
        }, (err) => {
          // Here I handle errors from the server,
          // I have only encountered a single error while registering: 'ER_DUP_ENTRY'
          // so I only need a simple terinary to handle errors rather than a switch case statement
          setError(err == 'ER_DUP_ENTRY' ? 'Username already exists.' : 'Unknown error');
        })
        .then(() => setWaitState(false)); // we are no longer waiting for a response no matter if the registration was successful or not
    } else {
      // Authenticate the user
      authenticateUser(username, password) // this function resolves if its successful or rejects if credentials dont match.
        .then((userID: number) => {
          setUserID(userID);
          setUsername(username);
        }, () => setError('Wrong username or password'))
        .then(() => setWaitState(false)); // set waiting state to false no matter the authentication success.
    }
  }

  return (
    <div className='chat-wrapper'>
      {
      userID==0 ? // the lowest userID is 1, so if its 0 it means the user is not logged in.
      <Login handleUserLogin={handleUserLogin} err={userError} waitState={waitingForResponse} />
      :
      <>
        <div className='messages-wrapper'>
          {
            messages.map((message, index) => (
              <Message key={index} messageData={message} />
            ))
          }
        </div>
        <Input userInput={userInput} setUserInput={setUserInput} sendMessage={handleNewMessage} />
      </>
      }
    </div>
  )
}
