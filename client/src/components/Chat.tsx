import Message from './Message.tsx'
import './styles/ChatStyles.css'
import { chatProps, messageType } from '../../types.ts'
import Input from './Input.tsx'
import { useEffect, useState } from 'react'
import Login from './Login.tsx'

export default function Chat({sendMessage, newUser, authenticateUser, messageRepeatLoad, socket}:chatProps) {
  const [userInput, setUserInput] = useState('')
  const [userID, setUserID] = useState(0)
  const [username, setUsername] = useState('')
  const [userError, setError] = useState<string>('')
  const [waitingForReponse, setWaitState] = useState<boolean>(false)
  const [messages, setMessages] = useState<messageType[]>([])

  const addNewMessage = (name:string, message:string) => setMessages(curMessages => [{name:name, message:message}, ...curMessages])

  useEffect(() => {
    messageRepeatLoad(500).then((c:messageType[]) => setMessages(c))
  }, [])

  socket.on('update messages', setMessages)
  socket.on('message', (sender:string, message:string) => addNewMessage(sender,message))
  
  const handleNewMessage = (message:string) => {
    sendMessage(userID, message)
    addNewMessage(username, message)
    setUserInput('')
  }

  const validateUserInput = (username:string, password:string) => {
    if (username.length==0) { setError('Please enter a username'); return false; }
    if (username[0]==' ') { setError('Username cannot start with a space'); return false; }
    if (password.length==0) { setError('Please enter a password'); return false; }

    const pureName = username.replace(/ /g,'')
    const purePass = password.replace(/ /g,'')

    if (pureName.length==0) { setError('Please enter a username that isnt filled with spaces'); return false; }
    if (purePass.length==0) { setError('Please enter a password that isnt filled with spaces'); return false; }
    
    return true
  }
  
  const handleUserLogin = (username:string, password:string, isRegistering=false) => {
    if (validateUserInput(username, password)==false || waitingForReponse) { return; }
    setWaitState(true)
    if (isRegistering) {
      newUser(username, password).then(newUserID => {
        setUserID(newUserID)
        setUsername(username)
      }, err => {
        let errorMessage='Unkown error';
        if (err=='ER_DUP_ENTRY') {errorMessage = 'Username already exists.'}
        setError(errorMessage)
      }).then(() => setWaitState(false))
    }else {
      authenticateUser(username, password).then((userID:number) => {
          if (userID==-1) {
            setError('Wrong username or password')
          }else { setUserID(userID); setUsername(username) }
          setWaitState(false)
      })
    }
  }

  return (
    <div className='chat-wrapper'>
      {
      userID==0 ?
      <Login handleUserLogin={handleUserLogin} err={userError} waitState={waitingForReponse} /> :
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
