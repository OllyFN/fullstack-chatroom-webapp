import { inputProps } from '../../types'
import './styles/InputStyles.css'
export default function Input({userInput, setUserInput, sendMessage}:inputProps) {

  const send = () => 
    userInput.replace(/ /g, '').length>0 && // makes sure the message isnt only just spaces
    sendMessage(userInput.trim()) // trim removes trailing spaces

  return(
    <div className='input-wrapper'>
      <input
        className='input'
        placeholder='Message'
        onChange={(e) => e.target.value.length<=50 && setUserInput(e.target.value)}
        onKeyDown={(e) => e.key=='Enter' && send()}
        value={userInput} />
      <div className='char-counter'>{userInput.length}/50</div>
      <button onClick={send} aria-label='send' className='send-button' />
    </div>
  )
}